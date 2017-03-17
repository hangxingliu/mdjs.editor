#!/usr/bin/env node

const from = 'src';
const to = 'dist';


var fs = require('fs-extra'),
	{ dirname } = require('path'),
	watcher = require('watch');

require('colors');

const TEMPLATE_REPLACE_REGEX = /\{\{\s+(modules|fields)\.(\w+?)\s+\}\}/g;

var rmIfExist = path => fs.existsSync(path) && fs.removeSync(path),
	safeWrite = (path, content, _) => (fs.existsSync(_ = dirname(path)) || fs.mkdirsSync(_)) + fs.writeFileSync(path, content),
	safeCopy = (from, to, _) => (fs.existsSync(_ = dirname(to)) || fs.mkdirsSync(_)) + fs.copySync(from, to);

var fields = {};

function main(quick = false) {
	quick || rmIfExist(to);
	quick || safeCopy(`${from}/lib`, `${to}/lib`);

	safeCopy(`${from}/scripts`, `${to}/scripts`);
	safeCopy(`${from}/styles`, `${to}/styles`);

	loadFields();
	
	safeWrite(`${to}/index.html`, buildTemplateFile(`index.html`));

	console.log(`  build done!`);
}

function loadFields() {
	try {
		fields = fs.readJSONSync(`${from}/fields.json`);
	} catch (e) { 
		console.error(`  error: load ${'fields'.bold} info failed!`);
		fields = {};
	}
}
function buildTemplateFile(fileName) {
	let content = fs.readFileSync(`${from}/${fileName}`, 'utf8');
	let lastContent = content, maxLoop = 10;
	while (maxLoop--) {
		content = content.replace(TEMPLATE_REPLACE_REGEX, templateReplaceFunc);
		if (content == lastContent) break;
		lastContent = content;
	}
	return content;
}
function templateReplaceFunc(_, type, name) {
	if (type == 'fields') {
		if (typeof fields[name] != 'undefined')
			return fields[name];
		console.error(`  error: fields.${name.bold} is not exists!`);
		return _;
	}
	let path = `${from}/modules/${name}.html`;
	if (fs.existsSync(path))
		return fs.readFileSync(path, 'utf8');		
	console.error(`  error: modules.${name.bold} is not exists!`);
	return _;
}

function watch() {
	console.log(`  watching source folder...`);
	watcher.unwatchTree(from);
	watcher.watchTree(from, { interval: 0.5 }, function (f, curr, prev) {
		console.log(' building...');
		if (typeof f == "object" && prev === null && curr === null) {
			// 首次扫描
			main();
		} else {
			main(true);
		}
	});
}

process.argv.length >= 3 ? watch() : main();