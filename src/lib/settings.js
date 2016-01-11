function loadSt(){
	var st = H5S.settings;
	var nv,type,name;
	$('[data-sttype]').each(function(){
		nv = $(this);
		type = nv.attr('data-sttype');
		name = nv.attr('data-stname');
		if(type=="boolean"){
			if(st[name])nv.addClass('set_checked');
			else nv.removeClass('set_checked');
		}else if(type=="string"){
			if(!st[name])nv.val('');
			else nv.val(st[name]);
		}
	});
}
function saveSt(){
	var st = {};
	var nv,type,name;
	$('[data-sttype]').each(function(){
		nv = $(this);
		type = nv.attr('data-sttype');
		name = nv.attr('data-stname');
		if(type=="boolean"){
			st[name] = nv.hasClass('set_checked');
		}else if(type=="string"){
			st[name] = nv.val();
		}
	});
	H5S.settings = st;
}
