declare class _LocalFileSystem{
	//读取文件的后缀名限制 
	suffixFilter: ['.md','.markdown'];
	//读取文件的最大尺寸限制
	sizeFilter: Number;//Max:5Mb

	on(eventName: String, callback: Function): this;
	readFile(file: String, charset: String): void;
	saveFile(contextLinkElement: Element, fname: String, content: String);
}
