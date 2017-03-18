/**
 * 
 * @param {Element} contextDOM 
 * @param {Map<String, Function>} callback 
 */
function initFileDragAndDrop(contextDOM, options) {
	var enterLevel = 0;

	contextDOM.addEventListener("dragover", function (event) {
		event.preventDefault();
	}, false);

	contextDOM.addEventListener("dragenter", function (event) {
		enterLevel++;
		options.enter && options.enter(event);
	}, false);

	contextDOM.addEventListener("dragleave", function (event) {
		if (--enterLevel) return;
		options.leave && options.leave(event);
	}, false);

	contextDOM.addEventListener("drop", function (event) {
		var fs = event.dataTransfer.files;
		options.drop && options.drop(fs[0] || null, event);
		fs[0] && event.preventDefault();
	}, false);
}