/*
 * 一些常用到的DOM元素
 */
filedlg = $('#filedlg');
$editorView = $('#editor');
inputView = $('#input');
outputView = $('#output');
filenameView = $('#filename span');
dlg_title = $('#helpset_title span');
dlg_iframe= $('#helpset_dlg iframe');
dlg_bd	  = $('#helpset_dlg');


/**
 * @description 目前编辑的Markdown文件对象
 * @type {File}
 */
window.nowFile = null;
/**
 * @description 准备打开的本地Markdown文件对象,如果加载成功,nowFile=loadingFile
 * @type {File}
 */
window.loadingFile = null;
/**
 * 默认文件名Untitled.md
 */
fileStatusChange(H5S.getValue('ebls')?H5S.title:"Untitled.md");


/**
 * 绑定本地文件读写的事件
 */
LIOEvent.onDone = onReadMdDone;
LIOEvent.onError = onReadMdError;
LIOEvent.onAbort = onReadMdAbort;

/**
 * 全局的快捷键集合
 * 存储方式:
 * shortcutMap[keyCode]=CallbackFunction
 */
window.shortcutMap = [];

/**
 * 初始化菜单按钮
 */
initMenuButton();

/**
 * 添加一个Window窗体尺寸改变事件来动态调整编辑器的输入框和预览区域的尺寸
 */
$(window).on('resize',resizeEditor);
$(function(){
	/*
	 * 当HTML文档装载好的时候:
	 * 需要绑定全局快捷键,调整一次编辑器的尺寸,从LocalStorage中读取一次之前保留的Markdown内容
	 */
	initShortcut();
	resizeEditor();
	setTimeout(resizeEditor,500);
	inputView.initHistory(1<<7);
	inputView.val(H5S.getValue('ebls')?H5S.content:"");
	inputView.record();
	outputView.html(Mdjs.md2html(inputView.val()));
});

/**
 * @description 初始化全局快捷键组件,请在页面加载完后加载
 */
function initShortcut(){
	document.onkeydown = function(e){
		if(!e.ctrlKey || e.shiftKey || e.altKey)return true;
		if(shortcutMap[e.which]==undefined)return true;
		shortcutMap[e.which]();
		return false;
	};
}

/**
 * @description 初始化编辑器顶部菜单的按钮,事件
 */
function initMenuButton(){
	$('#menu a').each(function(){
		var t = $(this),which = t.attr('data-op');
		if(!which)return;
		var e = eval('onMenu_'+which);
		var sc = t.attr('data-sc');
		t.click(e);
		if(sc){
			if(sc.length>1)sc=parseInt(sc);
			else sc=sc.toUpperCase().charCodeAt(0);
			shortcutMap[sc] = e;
		}
	});
}

/*
 * ----------------------------------
 * |    编辑器顶部菜单按钮的响应事件            |
 * ----------------------------------
 */

function onMenu_new(){
	showDialog('newdlg');
}
function onMenu_open(){
	$('#filedlg').click();
}
function onMenu_save(){
	saveMd(inputView.val(),nowFile.name);
}
function onMenu_export(){
	var fname = nowFile.name;
	fname = fname.slice(0,fname.lastIndexOf('.'));
	var linkcss = H5S.getValue('epcss');
	var html = Exporter.exportHTML(outputView.html(),fname,
		linkcss?linkcss:'http://git.oschina.net/voyageliu/mdjs/raw/master/mdcss.css');
	saveMd(html,fname+'.html');
}
function onMenu_help(){
	showIframeDlg('帮助关于','help.html');
}
function onMenu_settings(){
	showIframeDlg('设置选项','settings.html');
}

/*
 * -----------------------------------------
 * |   显示大对话框,用于展示帮助关于和设置页面        |
 * -----------------------------------------
 */

/**
 * @description 显示大对话框
 * @param {String} title 对话框标题
 * @param {URIString} url 对话框内页面的URL
 */
function showIframeDlg(title,url){
	dlg_title.text(title);
	dlg_iframe.height($editorView.height()-50).attr('src',url);
	dlg_bd.slideToggle(500);
}

/*
 * ---------------------------
 * |   文件选择控件的相关事件        |
 * ---------------------------
 */

/**
 * @description 当开始选择文件了,即触发了input[type=file]#filedlg的Click事件
 * @param {MouseEvent} e DOM事件
 */
function onFileClick(e){
	
}

/**
 * @description 当选择完文件了,即触发了input[type=file]#filedlg的Change事件
 * @param {Event} e DOM事件
 */
function onFileSelect(e){
	var fs = filedlg[0].files;
	if(fs.length>0){
		loadingFile = fs[0];
		loadMd(fs[0]);
	}
}
/**
 * @description 当编辑器被拖入了文件
 * @param {DragEvent} e DOM事件
 */
function onFileDropping(e){
	var fs = e.dataTransfer.files;
	if(fs.length==0)return ;//正常拖入文本图像什么的
	e.preventDefault();
	if(!checkMdName(fs[0].name)){
		Toast.err('拖入的不是Markdown文件',2000);
		return ;
	}
	loadingFile = fs[0];
	loadMd(fs[0]);
}

/*
 * ----------------------------------
 * |        基本对话框的一些 方法                  |
 * ----------------------------------
 */

/**
 * @description 显示新建文件的对话框2--(输入新的文件名对话框)
 */
function showNewFileDlg(){
	hideDialog('newdlg');
	var tv = $('#text_newname');
	tv.val(tv.attr('data-value'));
	showDialog('newnamedlg');
	tv.focus().select();
}

/**
 * @description 显示修改文件名的对话框
 */
function showModiNameDlg(){
	var tv = $('#text_modiname');
	tv.val(nowFile.name);
	showDialog('modinamedlg');
	tv.focus().select();
	tv[0].selectionEnd = nowFile.name.length-3;
}

/**
 * @description 当输入新的文件名对话框点击确定后
 */
function onNewFileDlgDone(){
	_modiName($('#text_newname').val().trim());
	inputView.val('').focus();
	hideDialog();
}

/**
 * @description 当改名对话框点击确定后
 */
function onModiNameDlgDone(){
	_modiName($('#text_modiname').val().trim());
	hideDialog();
}


/**
 * @description 修改当前编辑的内容的文件名 
 * @param {String} fname 文件名
 */
function _modiName(fname){
	if(!checkMdName(fname)){
		Toast.err('请输入有效的Markdown文件名',2000);
		return;
	}
	fileStatusChange(fname);
}

/**
 * @description 根据对话框ID显示指定对话框
 * @param {String} dlgId 对话框ID
 */
function showDialog(dlgId){
	$('.dialog_bg').show();
	$('#'+dlgId).slideDown(500);
}

/**
 * @description 根据对话框ID隐藏指定对话框
 * @param {String} dlgId 对话框ID
 */
function hideDialog(dlgId){
	if(!dlgId)return hideDialogAll();
	$('#'+dlgId).slideUp(500);
}
/**
 * @description 隐藏所有对话框
 */
function hideDialogAll(){
	$('.dialog').slideUp(500);
	setTimeout($('.dialog_bg').hide,500);
}

/**
 * @description 当正在编辑的文件状态发生变化时触发
 * @param {File|String} file 改变成的文件对象,或者文件名
 */
function fileStatusChange(file){
	if(typeof file == 'string')
		file = {name:file};
	nowFile = file;
	if(H5S.getValue('ebls'))H5S.title = file.name;
	filenameView.text(file.name);
}

/**
 * @description 读取本地Markdown文件出错,弹出提示
 * @param {String} e 错误信息
 */
function onReadMdError(e){
	Toast.err(e,2000);
}

/**
 * @description 读取本地Markdown文件被终止,弹出提示
 */
function onReadMdAbort(){
	Toast.warn('读取被中断',2000);
}

/**
 * @description  成功读入本地Markdown文件
 * @param {String} md 文件内容(Markdown)
 */
function onReadMdDone(md){
	fileStatusChange(loadingFile);
	inputView.val(md).focus().scrollTop(0);
	outputView.html(Mdjs.md2html(md));
	if(H5S.getValue('ebls'))H5S.content = md;
	Toast.text('读取文件('+loadingFile.name+')成功!',2000);
};


/**
 * @description 当编辑器输入框输入,滚动时进行的过程,包括响应Tab键,快捷键,实时显示,同步预览区域位置
 */
inputView.keydown(function(e){
	var sel0 = this.selectionStart,sel1 = this.selectionEnd;
	
	if(this.mustRecord){//由于上一次粘贴了文本,所以此次必须记录
		this.mustRecord=false;
		inputView.record();
	}else{
		inputView.autoRecord(e);
	}
	
	var v,p0,p1,p2;
	if(e.which==9 || e.which==13 || cEvent(e,1,0,0)){
		var v = this.value;
		var p0 = v.slice(0,sel0),p1 = v.slice(sel0,sel1),p2 = v.slice(sel1);
	}
	
	//按下Tab键
	if(e.which==9){
		if(cEvent(e,0,0,0)){//增加Tab键
			//只是为了插入一个Tab键
			if(sel0==sel1){
				this.value = p0+'\t'+p2;	
				this.selectionStart=this.selectionEnd=sel1+1;
			}else{//为了给每行开头插入Tab键
				var ti = p0.lastIndexOf('\n');
				if(ti==-1)p0='\t'+p0;
				else p0=p0.slice(0,ti+1)+'\t'+p0.slice(ti+1);
				ti = p1.length;
				p1 = p1.replace(/\n/g,'\n\t');
				this.value = p0+p1+p2;
				this.selectionStart=this.selectionEnd=sel1+p1.length-ti+1;
			}
			preview();
	        e.preventDefault();
		}
		if(cEvent(e,0,1,0)){//减少Tab键
			var offset = 0;
			var ti = p0.lastIndexOf('\n');
			if(p0[ti+1]=='\t')
				p0=p0.slice(0,ti+1)+p0.slice(ti+2),offset=1;
			ti = p1.length;
			p1 = p1.replace(/\n\t/g,'\n');
			this.value = p0+p1+p2;
			this.selectionStart=this.selectionEnd=sel1+ti-p1.length-offset;
			preview();
	        e.preventDefault();
		}
		this.mustRecord = true;
		return ;
	}
	
	//按下回车,自动添加Tab键
	if(e.which==13){
		var ti = p0.lastIndexOf('\n');
		var r = '';
		for(ti++;ti<p0.length;ti++){
			if(p0[ti]=='\n'){r='';break;}//此行空白
			if(p0[ti]!=' ' && p0[ti]!='\t')break;
			r+=p0[ti];
		}
		if(ti==p0.length)r='';//此行空白
		this.value = p0+'\n'+r+p2;
		this.selectionStart=this.selectionEnd=sel1-p1.length+r.length+1;
		preview();
	    e.preventDefault();
	    return ;
		//TODO 修改mdcss.css然后上线
	}
	
	if(cEvent(e,1,0,0)){//Ctrl别的键,加粗,斜体什么的
//		console.log(e.which);
		switch(e.which){
		case 66://B
			var l = p0.length;
			//去除Big
			if((p0[l-1]=='*' || p0[l-1]=='_') && p0[l-2]==p0[l-1]){
				if(p2[0]==p0[l-1] && p2[0]==p2[1]){
					this.value = p0.slice(0,-2)+p1+p2.slice(2);
					this.selectionStart = sel0-2,this.selectionEnd=sel1-2;
					break;
				}
			}
			//添加Big
			this.value = p0+'**'+p1+'**'+p2;
			this.selectionStart = sel0+2,this.selectionEnd=sel1+2;
			this.mustRecord = true;
			break;
		case 73://I
			var l = p0.length;
			//去除Big
			if(p0[l-1]=='*' || p0[l-1]=='_'){
				if(p2[0]==p0[l-1]){
					this.value = p0.slice(0,-1)+p1+p2.slice(1);
					this.selectionStart = sel0-1,this.selectionEnd=sel1-1;
					break;
				}
			}
			//添加Italy
			this.value = p0+'*'+p1+'*'+p2;
			this.selectionStart = sel0+1,this.selectionEnd=sel1+1;
			this.mustRecord = true;
			break;
		case 72://H
			var ti = p0.lastIndexOf('\n');
			var add = p0[ti+1]=='#'?'#':'# ';
			p0=p0.slice(0,ti+1)+add+p0.slice(ti+1);
			this.value = p0+p1+p2;
			this.selectionStart = this.selectionEnd = sel1+add.length;
			this.mustRecord = true;
			break;
		case 86://V Paste
			this.mustRecord = true;
			return;
		case 90://Z undo
			inputView.undo();
			break;
		case 89://Y redo
			inputView.redo();
			break;
		default:
			return ;
		}
		preview();
	    e.preventDefault();
	}
}).bind('input',preview//实时解析
).scroll(function(){//预览区域滚动
	var ih = inputView[0].scrollHeight - inputView.height(),
		oh = outputView[0].scrollHeight - outputView.height();
	var ipn = this.scrollTop;
	outputView[0].scrollTop = ipn/ih*oh;
});

/**
 * @description 判断给定的一个键盘事件e的ctrl键,shift键和alt键是否被按下或没被按下
 * @param {KeyboardEvent} e 键盘事件
 * @param {Boolean} ctrl 是否按下Ctrl键
 * @param {Boolean} shift 是否按下Shift键
 * @param {Boolean} alt 是否按下Alt键
 */
function cEvent(e,ctrl,shift,alt){
	return e.ctrlKey==ctrl && e.shiftKey==shift && e.altKey==alt;
}

/**
 * @description 预览编辑器输入框内Markdown的效果,并保存当前内容到LocalStorage
 */
function preview(){
	var md = inputView.val();
	if(H5S.getValue('ebls'))H5S.content = md;
	outputView.html(Mdjs.md2html(md));
}

/**
 * @description 动态调整编辑器输入框与预览区的尺寸
 */
function resizeEditor(){
	var w = $editorView.width()-30;
	$editorView.height($(window).height()-42);
	inputView.width(w*0.5);
	outputView.width(w*0.5);
	return true;
}