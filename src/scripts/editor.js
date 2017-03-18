var Editor = function() {
	var MAX_FILE_SIZE = 5 * 1024 * 1024;

	var mdjs = new Mdjs(getCustomMdjsRenderer());

	var Fs = new LocalFileSystem();
	var dlgBrowserFiles = browserStorageDialog;
	dlgBrowserFiles.onload(openFileInBrowserStorage);
	dlgBrowserFiles.ondel(list => toastInfo(`已删除 <b>${list.length}</b> 个浏览器存储的文件!`));

	var $container = $('#editorContainer'),	
		$fname = $container.find('.editor-filename')
			.click(() => showRenameDialog(currentFileInfo.title)),
		$dndTip = $container.find('.editor-dnd-tip'),
		$navbar = $('#editorNavbar'),
		$fileDialog = $('#editorFileDialog'),
		$fileSaver = $('#editorFileSaver'),
		$editor = $('#editor'),
		$editorWrapper = $container.find('.editor-wrapper'),
		$outputWrapper = $container.find('.output-wrapper'),
		$output = $('#output');
	
	var $dlgFileName = $('#dlgNewFile'),
		$dlgFileNameInput = $dlgFileName.find('input'),
		isCreatingNewFile = false,
		loadingFileName = '';

	var $toastContainer = $container.find('.editor-toast');

	var currentFileInfo = {
		id: 0,
		title: '',
		content: '',
		timestamp: 0
	};

	var outputTmpl = $('#editorOutputTmpl').html();

	$editor.keydown(e => {
		//按下Tab键 插入Tab
		if (e.which == 9) {
			insertText('\t');
			return e.preventDefault();
		}
		if (e.which == 13) { //回车
			//TODO 自动对齐缩进
		}

	}).bind('input', () => {
		preview();
	});
	$editorWrapper.scroll(function () {//预览区域滚动
		var ih = $editorWrapper[0].scrollHeight - $editorWrapper.height(),
			oh = $outputWrapper[0].scrollHeight - $outputWrapper.height();
		var ipn = this.scrollTop;
		$outputWrapper[0].scrollTop = ipn/ih*oh;
	});

	//绑定本地文件读取回调
	Fs.on('load', content => openFile(loadingFileName, content))
		.on('error', err => toastError('读取本地文件出错:<br/>' + err))
		.on('abort', () => toastWarn('读取本地文件操作被中断!'));

	//初始化文件拖入功能
	initFileDragAndDrop(document, {
		enter: () => $dndTip.show(),
		leave: () => $dndTip.hide(),
		drop: (file) => file ?
			Fs.readFile(file, 'utf8', $dndTip.hide(), loadingFileName = file.name) :
			$dndTip.hide()	
	});	
	//初始化导航栏的按钮事件
	initNavbarEvent();
	//初始化快捷键
	initShortcut();
	//初始化对话框相关
	initDialog();
	//恢复上次编辑内容
	restoreLastEditFile();

	function restoreLastEditFile() {
		var file = browserStorage.getLastEditFile();
		if (!file) return newFile();
		newFile(file.title, file.content, file.id);
		toastInfo(`已从浏览器存储内恢复了上次编辑文件<br><b>${file.title}</b>`, 2000);
	}

	function preview() {
		var markdown = $editor.val();
		currentFileInfo.content = markdown;
		//保存到localStorage(在内容不为空 或者 本来就存在于localstorage的情况)
		(markdown.trim() || browserStorage.exists(currentFileInfo.id) ) &&
			browserStorage.saveFile(currentFileInfo);

		//动态调整高度
		var ele = $editor[0], baseRow = markdown.split('\n').length;
		do {
			ele.rows = Math.max(baseRow, 20);
			baseRow += 5;
		} while(ele.scrollHeight > ele.clientHeight);
		$output.html(mdjs.md2html(markdown));
	}

	function setEditorSelection(start, end) {
		$editor[0].selectionStart = start;
		$editor[0].selectionEnd = end;
	}
	function getEditorSelection() {
		return { start: $editor[0].selectionStart, end: $editor[0].selectionEnd };
	}
	function insertText(text) {
		document.execCommand('insertText', false, text);
	}


	/**
	 * @param {String} [fname] 
	 * @param {String} [content] 
	 * @param {Number} [id] 
	 */
	function newFile(fname, content, id) {
		$editor.val(content || '');
		currentFileInfo = { id: id || Date.now(), title: fname || '空白文档', content: content };
		_updateFileNameInThePage();
		preview();
	}
	function renameFile(fname) {
		currentFileInfo.title = fname;
		_updateFileNameInThePage();
	}
	function openFile(fname, content) {
		var match = fname.match(/^(.+)\./);
		fname = match ? match[1] : fname;
		newFile(fname, content);
		toastSuccess(`读取本地文件成功!<br/><b>${fname}</b>`);
	}
	function openFileInBrowserStorage(file) {
		newFile(file.title, file.content, file.id);
		toastInfo(`加载成功!<br/><b>${file.title}</b>`, 2000);
	}
	function exportMarkdown() {
		Fs.saveFile($fileSaver[0], currentFileInfo.title + '.md', $editor.val());
	}
	function exportHTML() {
		var obj = { title: getDocTitle(), body: $output.html(), toc: $output.find('#md_toc_content').html()},
			html = outputTmpl.replace(/\{\{\s+(\w+)\s+\}\}/g, (_, name) => obj[name] || '');
		//展开TOC
		html = html.replace('__show_if_export__', 'show');
		Fs.saveFile($fileSaver[0], currentFileInfo.title + '.html', html);
		function getDocTitle() {
			return ($output.find('h1,h2,h3,h4,h5,h6').eq(0).text()
				|| $output.find('p:eq(0)').text()).replace(/[\s\\\/\.\?\*\<\>\(\)\|\:\'\"]+/g, ' ');
		}
	}

	function _updateFileNameInThePage() {$fname.text(currentFileInfo.title)}

	function clickOpenLocalFile() {
		$fileDialog.off('change').on('change', () => {
			var file = $fileDialog[0].files[0], err;
			if (!file) return;
			if (!(err = _checkFileObj(file) ))	
				return Fs.readFile(file, 'utf8', loadingFileName = file.name);
			toastError(err.error);
		}).click();
	}
	
	/**
	 * @description 检查一个文件对象是否合规(文件名和尺寸)
	 * @param {File} file
	 * @return {Object|void}
	 */
	function _checkFileObj(file) {
		var fname = file.name.toLowerCase();
		if(!fname.endsWith('.md') && !fname.endsWith('.markdown'))
			return { error: '你选择的文件不是Markdown文件' };
		if(file.size > MAX_FILE_SIZE)
			return { error: '你选择的文件过大,无法打开!' };
		return;
	}

// Navbar button ====================
	function initNavbarEvent() {
		var eventMap = {
			"new": showNewFileDialog,
			open_local: clickOpenLocalFile,
			open_browser: dlgBrowserFiles.open,
			export_markdown: exportMarkdown,
			export_html: exportHTML
		};
		$navbar.find('[data-navid]').each((i, e) => $(e).bind('click', eventMap[$(e).data('navid')]));
	}
//===================== Navbar button

// Dialog ===========================
	function initDialog() {
		$dlgFileName.on('shown.bs.modal', () => {
			$dlgFileNameInput.focus().select();
			$dlgFileNameInput[0].selectionStart = 0;
			$dlgFileNameInput[0].selectionEnd = $dlgFileNameInput.val().length;
		}).find('.btn-ok').click(() => {
			var fname = $dlgFileNameInput.val().trim();
			if (!fname)
				return $dlgFileNameInput.addClass('form-control-danger')
					.parents('.input-group').addClass('has-danger');
			$dlgFileName.modal('hide');
			isCreatingNewFile ? newFile(fname) : renameFile(fname);
		}).end().find('input').focusin(() => {
			$dlgFileNameInput.removeClass('form-control-danger')
				.parents('.input-group').removeClass('has-danger');
		}).keydown(event => void (event.which == 13 && $dlgFileName.find('.btn-ok').click()) );
	}
	function showRenameDialog() { isCreatingNewFile = false;_showFileNameDialog('修改名称', currentFileInfo.title); }
	function showNewFileDialog() { isCreatingNewFile = true; _showFileNameDialog('新建文件', '空白文档'); }
	function _showFileNameDialog(title, filename) {
		$dlgFileName.modal().find('.modal-title').text(title).end().find('input').val(filename);
	}

//============================ Dialog

//  Toast ===========================
	function toast(type, msg, time) {
		var $alert = $toastContainer.find('.alert').hide().end()
			.find(`.alert-${type}`);
		$alert.fadeIn().find('span').html(msg);
		setTimeout(() => $alert.fadeOut(), time || 4000);
	}
	function toastError(msg, time) { toast('danger', msg, time); }
	function toastWarn(msg, time) { toast('warning', msg, time); }
	function toastSuccess(msg, time) { toast('success', msg, time); }
	function toastInfo(msg, time) { toast('info', msg, time);}
//=============================  Toast

//  KeyShortcut ======================
	var shortcutFuncMap = {};
	function initShortcut() {
		document.onkeydown = e => {
			if(!e.ctrlKey || e.shiftKey || e.altKey)return true;
			if (shortcutFuncMap[e.which] == undefined) return true;
			shortcutFuncMap[e.which]();
			return false;
		};
	}
//=======================  KeyShortcut
	
};
window.editor = new Editor();