/*
 * 基于HTML5的LocalStorage进行内容,设置的存储脚本
 */

window.H5S = {
	get content(){
		return this.ct.content;
	},
	set content(c){
		this.ct.content = c;
		this._set();
	},
	get title(){
		return this.ct.title;
	},
	set title(t){
		this.ct.title = t;
		this._set();
	},
	get settings(){
		if(localStorage.mdjset_st)
			return this.sCache = JSON.parse(localStorage.mdjset_st);
		else return this.sCache = {};
	},
	set settings(s){
		localStorage.mdjset_st = JSON.stringify(s);
	},
	getValue:function(setKey){
		if(this.sCache==undefined)var a = this.settings;
		return this.sCache[setKey];
	},
	_get:function(){
		if(localStorage.mdjset_ct)this.ct = JSON.parse(localStorage.mdjset_ct);
		else this.ct = {title:'Untitled.md',content:''};
	},
	_set:function(){
		localStorage.mdjset_ct = JSON.stringify(this.ct);
	}
};
H5S._get();
