/**
 * 将生成的HTML代码导出的工具类
 */
function Export(){
	/**
	 * 导出的HTML文件内容的模版
	 */
	this.template = [
		'<html>',
			'<head>',
				'<meta charset="utf-8">',
				'<title>'+'${fname}'+'</title>',
				'<link rel="stylesheet" type="text/css" href="${csspath}"/>',
			'</head>',
			'<body>',
				'<div class="md">',
					'${content}',
				'</div>',
			'</body>',
		'</html>'
	];
}
/**
 * 导出HTML
 * @param {String} html 原始的HTML内容
 * @param {String} fname Markdown的文件名(无后缀的)
 * @param {String} csspath 所需要的样式表的路径
 * @return {String} 完整的HTML
 */
Export.prototype.exportHTML = function(html,fname,csspath){
	var result = '';
	if(!fname)fname='';
	if(!csspath)csspath='';
	for(var i=0,to=this.template.length;i<to;i++){
		result+=this.template[i]
			.replace('${fname}',fname)
			.replace('${csspath}',csspath)
			.replace('${content}',html)+'\n';
	}
	return result;
};
window.Exporter = new Export();
