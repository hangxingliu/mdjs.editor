(function() {
	var CLASS_DELETE = 'list-group-item-danger';
	
	var $dlgBrowserFiles = $('#dlgBrowserFiles'),
		$dlgBrowserFilesList = $dlgBrowserFiles.find('.list-group');

	var _tmpl = $dlgBrowserFiles.find('.list-item-template').html(),
		tmpl = obj => _tmpl.replace(/\{\{\s+(\w+?)\s+\}\}/g, (_, name) => obj[name] || '');
	
	var storage = browserStorage;

	var callback = null, callbackDel;
	var deleteBufferArea = {};
	var files = storage.getFiles();
	
	$dlgBrowserFiles.on('hide.bs.modal', () => {
		var list = Object.keys(deleteBufferArea);
		if (!list.length) return;
		var result = storage.delFiles(list);
		callbackDel && callbackDel(result);
	});

	function openDialog(currentFileId) {
		var to2 = num => num ? (num >= 10 ? `${num}` : `0${num}`) : '00';
		files = storage.getFiles();
		files.forEach(file => {
			var title = file.title,
				timestamp = file.timestamp,
				date = timestamp ? (new Date(timestamp)) : null,
				dateStr = !date ? '--' :
					(`${date.getFullYear()}年${to2(date.getMonth() + 1)}月${to2(date.getDate())}日` +
						` ${to2(date.getHours())}:${to2(date.getMinutes())}`);
			file.titleDisplay =
				(currentFileId == file.id ? `<b>${title}</b>(正在编辑)` : title) +
				` <small class="text-muted">${dateStr}</small>`;
		});
		$dlgBrowserFilesList.html(files.map(tmpl).join('') ||
			'<p class="text-center text-muted"><br/>无文件</p>');
		$dlgBrowserFiles.modal();
		deleteBufferArea = {};
	}
	function onClickOpenFile(id) {
		if (id in deleteBufferArea) return;
		$dlgBrowserFiles.modal('hide');
		var [file] = files.filter(file => file.id == id);
		callback && callback(file);
	}
	function onClickDeleteFile(id) {
		var $it = $dlgBrowserFilesList.find(`[data-id=${id}]`)
			.addClass(CLASS_DELETE),
			$title = $it.find('.item-btn-title');
		$title.html(`<del class="text-danger">${$title.html()}</del>`);
		$it.find('.item-btn-del').hide();
		deleteBufferArea[id] = true;
		setTimeout(() => $it.find('.item-btn-undo').show(), 300);
	}
	function onClickUndoDelete(id) {
		var $it = $dlgBrowserFilesList.find(`[data-id=${id}]`)
			.removeClass(CLASS_DELETE),
			$title = $it.find('.item-btn-title');
		$title.html($title.find('del').html());
		$it.find('.item-btn-undo').hide();
		delete deleteBufferArea[id];
		setTimeout(() => $it.find('.item-btn-del').show(), 300);
	}	
	window.browserStorageDialog = {
		open: openDialog,
		_clickOpen: onClickOpenFile,
		_clickDel: onClickDeleteFile,
		_clickUndo: onClickUndoDelete,
		onload: cb => callback = cb,
		ondel: cb => callbackDel = cb
	};
})();