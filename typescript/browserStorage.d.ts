interface _BrowserStorage{
	getFiles(): Array<_BrowserStorageFileObj>
	setLastEditFileId(id: Number): void;
	getLastEditFile(): _BrowserStorageFileObj | null;
	saveFile(obj: _BrowserStorageFileObj): void;
	exists(id: Number): Boolean;
	getFile(id: Number): _BrowserStorageFileObj;
}
interface _BrowserStorageFileObj {
	id: Number;
	title: String;
	content: String;
}
declare var browserStorage: _BrowserStorage;
