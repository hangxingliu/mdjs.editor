function LocalFileSystem() {
	var thiz = this;
	
	var listener = {},
		event = (e,param) => listener[e] && listener[e](param);

	var fileReader = new FileReader();

	fileReader.onload = e => event('load', e.target.result);
	fileReader.onerror = e => event('error', e.target.error);
	fileReader.onabort = e => event('abort', e);

	this.on = (eventName, callback) => ((listener[eventName] = callback), thiz);
	this.readFile = readFile;
	this.saveFile = saveFile;
	
	/**
	 * @description 加载一个本地Markdown文件
	 * @param {File} file 文件对象
	 * @param {String} charset 读取时使用的文件编码
	 */
	function readFile(file,charset){
		fileReader.readAsText(file,charset);
	}

	/**
	 * @description 通过调用系统对话框保存Markdown文件到本地
	 * @see 需要用到页面上的input[type=file]#filesave元素
	 */	
	function saveFile(contextLinkElement, fname, content) {
		try{
			var blob = new Blob([content],{"type":"application\/octet-stream"});
			var ClassURL = typeof URL == 'undefined' ? webkitURL : URL;
			console.clear();//去掉那个万恶的警告
			var url = ClassURL.createObjectURL(blob);
			var saver = contextLinkElement;
			saver.href = url;saver.download = fname;
			saver.click();
			ClassURL.revokeObjectURL(url);
		}catch(e){
			//保存出错
			console.error(e);
		}
	}
}
