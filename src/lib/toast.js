/*
 * 用来显示Toast弹出内容的脚本
 */
/**
 * @constructor 构建一个新的Toast
 */
function Toast(){
	$('body').append('<div class="toast_bg"><div id="toast" class="toast_bd"></div></div>');
	this.view = $('#toast');
}
/**
 * @description 显示一个正常的文本Toast
 * @param {String} t 显示的文本
 * @param {Number} time 显示的时间(可选,为空则表示不自动消失)
 */
Toast.prototype.text = function(t,time){
	this.setStyle('#dff0d8','#3c763d','#d6e9c6');
	this.show(t,time);
};
/**
 * @description 显示一个警告Toast
 * @param {String} t 显示的警告内容
 * @param {Number} time 显示的时间(可选,为空则表示不自动消失)
 */
Toast.prototype.warn = function(w,time){
	this.setStyle('#fcf8e3','#8a6d3b','#faebcc');
	this.show(w,time);
};
/**
 * @description 显示一个错误Toast
 * @param {String} t 显示的错误内容
 * @param {Number} time 显示的时间(可选,为空则表示不自动消失)
 */
Toast.prototype.err = function(e,time){
	this.setStyle('#f2dede','#a94442','#ebccd1');
	this.show(e,time);
};
/**
 * @description 为要准备显示出来的Toast设置颜色样式
 * @param {ColorString} bc 背景颜色
 * @param {ColorString} c 前景颜色
 * @param {ColorString} sc 边框和边影颜色
 */
Toast.prototype.setStyle = function(bc,c,sc){
	this.view.css({
		'background-color': bc,
		'color' : c,
		'border-color' : sc,
		'box-shadow' : '0 0 20px '+sc,
		'-webkit-box-shadow' : '0 0 20px '+sc
	});
}
/**
 * @description 显示一个Toast,<b>不建议手动调用</b>
 * @deprecated 不建议手动调用
 * @param {String} m 显示的内容
 * @param {Number} time 显示的时间(可选,为空则表示不自动消失)
 */
Toast.prototype.show = function(m,time){
	this._show(m);
	if(time)setTimeout(Toast._hide,time);
};
Toast.prototype._show = function(m){
	var v = Toast.view;
	if(v.css('display')!='none')
		this._hide();
	v.html(m);
	try{v.fadeIn(500);}catch(e){v.show();}
};
Toast.prototype._hide = function(){
	var v = Toast.view;
	try{v.fadeOut(500);}catch(e){v.hide();}
};
window.Toast = new Toast();
