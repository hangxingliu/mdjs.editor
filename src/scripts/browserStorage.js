function BrowserStorage() {
	var storage = localStorage;
	var thiz = this;
	var PREFIX = 'mdjs_file_',
		KEY_LAST_FILE = 'last_mdjs_file';

	this.getFiles = () => {
		var len = storage.length, key, result = [];
		for (var i = 0; i < len; i++) {
			if ((key = storage.key(i)).startsWith(PREFIX)) {
				try {
					result.push(JSON.parse(storage.getItem(key)));
				} catch (e) {
					console.error(`Loading item "${key}" from local storage failed!`);
					console.error(e);
				}
			}
		}
		return result;
	};
	this.setLastEditFileId = id => storage.setItem(KEY_LAST_FILE, String(id) );
	this.getLastEditFile = () => {
		var key = PREFIX + (parseInt(storage.getItem(KEY_LAST_FILE)) || 0);
		try {
			var obj = storage.getItem(key);
			return obj ? JSON.parse(obj) : null;
		} catch (e) {
			console.error(`Loading item "${key}" from local storage failed!`);
			console.error(e);
			return null;
		}
	};
	this.getFile = id => {
		var key = PREFIX + id;
		try {
			var obj = storage.getItem(key);
			return obj ? JSON.parse(obj) : null;
		} catch (e) {
			console.error(`Loading item "${key}" from local storage failed!`);
			console.error(e);
			return null;
		}
	};
	this.delFiles = ids => {
		var result = [], tmpFile;
		ids.forEach(id => (tmpFile = thiz.getFile(id)) && result.push(tmpFile));
		result.forEach(file => storage.removeItem(PREFIX + file.id));
		return result;
	};
	this.exists = id => !!storage.getItem(PREFIX + id);
	this.saveFile = ({ id, title, content }) => {
		storage.setItem(PREFIX + id, JSON.stringify({ id, title, content, timestamp: Date.now() }));
		thiz.setLastEditFileId(id);

	}
}
window.browserStorage = new BrowserStorage();