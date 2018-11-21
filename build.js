#!/usr/bin/env node
//@ts-check

require('colors');

const fs = require('fs-extra');
const { dirname, join } = require('path');
const watcher = require('watch');


const from = join(__dirname, 'src');
const to = join(__dirname, 'dist');
const node_modules = join(__dirname, 'node_modules');

const TEMPLATE_REPLACE_REGEX = /\{\{\s+(modules|fields)\.(\w+?)\s+\}\}/g;

let fields = {};

function main(quick = false) {
	if (!quick) {
		rmIfExist(to);
		safeCopy(`${from}/scripts`, `${to}/scripts`);
		safeCopy(
			`${node_modules}/md-js/mdjs.min.js`,
			`${from}/lib/mdjs/mdjs.min.js`);
	}

	loadFields();
	
	safeWrite(`${to}/index.html`, buildTemplateFile(`index.html`));

	console.log(`  build done!`);
}

function rmIfExist(path) {
	if(fs.existsSync(path))
		fs.removeSync(path);
}

function safeWrite(path, content) { 
	const dir = dirname(path);
	if (!fs.existsSync(dir))
		fs.mkdirsSync(dir);
	fs.writeFileSync(path, content)
}

function safeCopy(from, to) {
	const dir = dirname(to);
	if (fs.existsSync(dir))
		fs.mkdirsSync(dir);
	fs.copySync(from, to)
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