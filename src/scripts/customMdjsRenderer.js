/// <reference path="../../typescript/md-js.d.ts" />

/**
 * @returns {ClassMdjsRenderer}
 */
function getCustomMdjsRenderer() {
	var renderer = new Mdjs.MdjsRenderer();
	
	renderer.func.table = (headContent, bodyContent) =>
		`<table class="table table-bordered"><thead>${headContent}</thead><tbody>${bodyContent}</tbody></table>`;
	
	renderer.tag.quote = [
		'<blockquote class="bg-faded"> ',
		'</blockquote>'
	];

	renderer.tag.toc = [
		`<div class="card mb-3 mt-2" id="md_toc">
			<div class="card-block">
				<h4 class="card-title mb-0" 
					style="cursor: pointer;line-height:1.1"
					data-toggle="collapse" href="#md_toc_content" >
					Table Of Contents</h4>
				<div class="collapse mt-3 __show_if_export__" id="md_toc_content">
				`,
		`		</div>
			</div>
		</div>`
	];
	renderer.tag.tocList = ['<ul style="padding-left:1em;padding-bottom:.5em;list-style:none">', '</ul>'],
	renderer.tag.tocItem = ['<a href="#$uri"><li style="padding-bottom: .35em">', '</li></a>'];
	
	renderer.tag.codeBlock = [
		'<div class="card my-2 bg-faded"><div class="card-block"><h6 class="card-subtitle text-muted">$language</h6>' +
		'<pre><code>',
		'</code></pre></div></div>'
	];
	renderer.tag.footNote = [
		`<div class="md-foot"><br/><hr/><br/><ol>`,
		`</ol></div>`];

	renderer.func.heading = (level, name, content) =>
		`<h${level} id="${name}" name="${name}">${content}</h${level}>${level==1?'<hr style="margin-bottom: 1.2rem"/>':''}`;
	
	renderer.func.image = (uri, title, altText) =>
		`<img alt="${Mdjs.escapedHTML(altText)}" 
				title="${Mdjs.escapedHTML(title)}" 
				src="${encodeURI(uri)}" />
		<span class="md-img-text text-center">${altText}</span><br/>`;
	
	renderer.func.link = (uri, title, content) =>
		`<a target="_blank" title="${Mdjs.escapedHTML(title)}" href="${encodeURI(uri)}">${content}</a>`;
	
	return renderer;
}
