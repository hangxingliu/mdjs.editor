/*
 * 用于支持编辑器拥有撤销和重做的历史记录功能的脚本
 * 
 * maxUndo : 最大有效记录数(即最多可撤销次数)
 * maxSize : 最大记录数(比最大有效记录数大一半,当最大记录数满的时候才会清空过久的历史记录)
 * 
 * arDelay : 在记录历史记录前按下的有效按键次数.在一般情况下,当这个数值达到一定大小时才会触发自动记录
 * arLenCmp: 在记录历史记录前内容的长度.在一般情况下,当这个数值与当前内容长度之差达到一定大小时才会触发自动记录
 * 
 * 非一般情况:当回删,换行结束,回删结束的情况下会自动记录
 * 
 * firstUndo: 判断当次撤销是否为在手动修改内容后的第一次撤销
 * (在第一次撤销后赋为false,在按下有效键后赋为true)
 * 
 * 历史记录content结构:
 * [ContentText,SelectionStart,SelectionEnd]
 */

/**
 * @description 历史记录栈核心类
 * @constructor
 * @param {Number} maxUndo 最大有效记录数
 */
function EdHistory(maxUndo){
	this.inn = [];
	this.q = 0;//历史记录栈的插入查询光标
	this.maxUndo = maxUndo;
	this.maxSize = (this.maxUndo*3)>>1;
}
/**
 * @description 加入一条历史记录
 * @param {Object} content 历史记录内容
 */
EdHistory.prototype.into = function(content){
	if(!this.inn[this.q]){
		this.inn[this.q++]=content;
		this.inn.length = this.q;
	}else{
		this.inn[++this.q] = content;
		this.inn.length = this.q+1;
	}
	var il = this.inn.length;
	if(il>=this.maxSize){
		var sub = il-this.maxUndo;
		for(var i=0;i<this.maxUndo;i++)
			this.inn[i] = this.inn[i+sub];
		this.inn.length = this.maxUndo;
	}
};
/**
 * @return 返回撤销一条历史记录的内容
 */
EdHistory.prototype.undo = function(){
	this.q--;if(this.q<0)this.q=0;
	return this.inn[this.q];
};

/**
 * @return 返回重做一条历史记录的内容
 */
EdHistory.prototype.redo = function(){
	if(this.inn[this.q])
		return this.inn[this.q++];
};
/**
 * @description 为JQ控件初始化历史记录
 * @param {Number} max 最大可撤销数
 */
$.fn.initHistory = function(max){
	this.his = new EdHistory(max);
	this.dom = this[0];
	this.arDelay = 0;
	this.arLenCmp= 0;
};
/**
 * @description 根据键盘事件自动判断是否应该被记录入历史记录
 * @param {KeyboardEvent} e 输入框的键盘事件
 */
$.fn.autoRecord = function(e){
	this.arDelay++;
	
	//newArLen
	var nAr = this.val().length;
	
	if(!e.ctrlKey && !e.altKey)this.firstUndo=true;
	
	//LastEventKeyCode
	if(this.lastKC != 8 && e.which == 8){//开始按回删键了
		this.record();
	}else if((this.lastKC == 8 || this.lastKC == 13) &&
		e.which != this.lastKC){//上次是回删/回车,这次输入字符了,要记录
		this.record();
	}else if(this.arDelay >= 16 && Math.abs(nAr-this.arLenCmp)>=16){
		this.arLenCmp = nAr;
		this.record();
	}
	
	this.lastKC = e.which;
};
/**
 * @description 强制记录入历史记录
 */
$.fn.record = function(){
	this.his.into([this.val(),this.dom.selectionStart,this.dom.selectionEnd]);
	this.arDelay = 0;
	this.firstUndo=true;
};
/**
 * @description 从历史记录中撤销一步
 */
$.fn.undo = function(){
	if(this.firstUndo){//记录当前
		this.record();
		this.his.undo();
		this.firstUndo=false;
	}
	var v = this.his.undo();
	if(!v)return ;
	this.val(v[0]);
	this.dom.selectionStart = v[1];
	this.dom.selectionEnd	= v[2];
	this.arDelay = 0;
};
/**
 * @description 从历史纪录中重做一步
 */
$.fn.redo = function(){
	var v = this.his.redo();
	if(!v)return ;
	this.val(v[0]);
	this.dom.selectionStart = v[1];
	this.dom.selectionEnd	= v[2];
	this.arDelay = 0;
};
