/**
 * @constructor 本地文件读写的事件接口
 */
function LIOEvent(){};
/**
 * @description 当成功读取文件时的默认响应事件
 */
LIOEvent.prototype.onDone = function(md){console.log('LocalIO读取成功,长度:'+md.length);};
/**
 * @description 当读取文件失败时的默认响应事件
 */
LIOEvent.prototype.onError = function(err){console.error(err);};
/**
 * @description 当读取文件被中断的默认响应事件
 */
LIOEvent.prototype.onAbort = function(){console.warn('LocalIO读取被中断!');};
window.LIOEvent = new LIOEvent();

//HTML5本地文件读取类的封装
window.lio = {};
lio.r = new FileReader();
lio.r.onload = function(e){LIOEvent.onDone(e.target.result);};
lio.r.onerror= function(e){LIOEvent.onError(e.target.error);};
lio.r.onabort= function(e){LIOEvent.onAbort();};

//读取文件的后缀名限制 
lio.nlimit = ['.md','.markdown'];
//读取文件的最大尺寸限制
lio.slimit = 1024*1024*5;//Max:5Mb

/**
 * @description 检查一个文件名是否符合Markdown文件名规范
 * @param {String} fname 文件名
 * @return {Boolean} 
 */
function checkMdName(fname){
	var n = fname.toLowerCase();
	for(var i=0;i<lio.nlimit.length;i++)
		if(n.slice(-lio.nlimit[i].length)==lio.nlimit[i])
			break;
	return i<2;
}

/**
 * @description 加载一个本地Markdown文件
 * @param {File} file 文件对象
 * @param {String} charset 读取时使用的文件编码
 */
function loadMd(file,charset){
	if(file.size>lio.slimit){
		LIOEvent.onError('你选择的文件过大,无法打开!');return;
	}
	if(!checkMdName(file.name)){
		LIOEvent.onError('你选择的文件不是Markdown文件');return;
	}
	lio.r.readAsText(file,charset);
}

/**
 * @description 通过调用系统对话框保存Markdown文件到本地
 * @see 需要用到页面上的input[type=file]#filesave元素
 */
function saveMd(md, fname) {
	try{
	    var blob = new Blob([md],{"type":"application\/octet-stream"});
		var URL = URL || webkitURL || window;
		console.clear();//去掉那个万恶的警告
	    var url = URL.createObjectURL(blob);
	    var saver = document.getElementById('filesave');
	    saver.href = url;saver.download = fname;
	    saver.click();
	    URL.revokeObjectURL(url);
	}catch(e){
		//保存出错
		console.error(e);
	}
}