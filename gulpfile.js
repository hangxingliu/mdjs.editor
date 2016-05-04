/*
 * 用于发布优化的mdjs.editor而使用的gulp构建工具的配置文件
 * 
 * 时间:2016/01/11
 * 作者:刘越
 */

//-------------_____一些必要的字段置______---------------------
var show_forkme = 'true';

var src_path = './src/';
var dist_path = './dist/';
var now = new Date().getTime();

var minihtml_opts = {
	removeComments:true,//去掉HTML注释
	collapseWhitespace:true,//去掉空白字符
	collapseBooleanAttributes:true,//如果属性如这样readonly=readonly >这变成readonly >
	removeAttributeQuotes:true,//有必要时去掉属性引号
	removeEmptyAttributes:true,//去掉空白属性
	removeScriptTypeAttributes:true,
	removeStyleLinkTypeAttributes:true,
	minifyJS : true
};

//-------------____引入一些必要的Gulp外挂____-------------------
var g			= require("gulp");
var cl			= require("gulp-clean");
var concat		= require("gulp-concat");
var minijs		= require('gulp-uglify');
var minicss		= require('gulp-minify-css');
var minihtml	= require('gulp-htmlmin');
var pp 			= require('gulp-preprocess');

//-------------______Gulp任务开始___________-----------------
//任务入口
g.task('r',['release']);
g.task('release',['update_manifest'],function(){
	console.log('Mdjs.editor发布到dist目录完成');
});

//更新cache.manifest文件
g.task('update_manifest',['handler_html'],function(){
	var s = g.src(src_path + '**/*.manifest',{'base':''})
		.pipe(pp({context:{
			UPDATE_TIME : now
		 } }))
		.pipe(g.dest(dist_path));
	console.log('更新manifest文件完成');
	return s;
});

//优化处理HTML文件
g.task('handler_html',['cp_js_to_one'],function(){
	var s = g.src(src_path + '**/*.html',{'base':''})
		.pipe(pp({context:{
			ALL_SCRIPT : '<script src="lib/editor.all.js"></script>',
			ALL_STYLESHEET : '<link rel="stylesheet" href="css/editor.all.css"/>',
			GITHUB_DEMO : show_forkme//设置这句话
		 } }))
		.pipe(minihtml(minihtml_opts))
		.pipe(g.dest(dist_path));
	console.log('HTML文件优化完成');
	return s;
});

//合并并优化Javascript文件
g.task('cp_js_to_one',['handler_js'],function(){
	var s = g.src([
			src_path + 'lib/toast.js',
			src_path + 'lib/mdjs.js',
			src_path + 'lib/localio.js',
			src_path + 'lib/h5storage.js',
			src_path + 'lib/export.js',
			src_path + 'lib/history.jq.js',
			src_path + 'lib/editor.js'
			],{'base':''})
		.pipe(concat('lib/editor.all.js',{newLine: ';'}))
		.pipe(minijs())
		.pipe(g.dest(dist_path));
	console.log('部分Javascript文件合并并优化处理完成');
	return s;
});

//优化Javascript文件
g.task('handler_js',['handler_css_to_one'],function(){
	var s = g.src([
			src_path + 'lib/*.min.js',
			src_path + 'lib/h5storage.js',
			src_path + 'lib/settings.js'
		 ],{'base':'src'})
		.pipe(minijs())
		.pipe(g.dest(dist_path));
	console.log('Javascript文件优化处理完成');
	return s;
});

//合并且优化CSS文件
g.task('handler_css_to_one',['handler_css'],function(){
	var s =	g.src([
			src_path + 'css/editor.css',
			src_path + 'css/dialog.css',
			src_path + 'css/toast.css'
			],{'base':''})
		.pipe(concat('css/editor.all.css'))
		.pipe(minicss())
		.pipe(g.dest(dist_path));
	console.log('部分CSS文件合并并优化处理完毕');
	return s;	
});

//优化CSS文件
g.task('handler_css',['clean'],function(){
	var s =	g.src([
		src_path + 'css/settings.css',
		src_path + 'css/mdcss.css'
		],{'base':'src'})
		.pipe(minicss())
		.pipe(g.dest(dist_path));
	console.log('CSS文件优化处理完毕');
	return s;	
});

//清理接下来要优化更新的文件
g.task('clean',['handler_files'], function(){
	var s = g.src(genCleanFilesList(['js','css','html','manifest']),{'read': false})
		.pipe(cl());
	console.log('清理dist目录中需要处理的文件完毕')	
	return s;
});

//复制全部文件到dist目录
g.task('handler_files',['clean_all'],function(){
	var s = g.src(src_path + '**/*',{'base':''})
		.pipe(g.dest(dist_path));
	console.log('初次复制文件到dist目录完毕');
	return s;
});

//清空dist目录
g.task('clean_all',function(){
	var s = g.src([dist_path+'*'], {'read': false}).pipe(cl());
	console.log('清理dist目录完毕')	
	return s;
});

/**
 * @description 根据指定后缀名生成src匹配式数组
 * @param {Array} suffix 后缀名数组
 */
function genCleanFilesList(suffix){
	var ret = [];
	for (var i in suffix)
		ret.push('./'+dist_path+'**/*.'+suffix[i]);
	return ret;
}
