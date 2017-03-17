/// <reference path="browserStorage.d.ts" />

interface _BrowserStorageDialog {
	open(): void;
	_clickOpen(id: Number): void;
	_clickDel(id: Number): void;
	_clickUndo(id: Number): void;
	onload(callback: (obj: _BrowserStorageFileObj) => void): void;
	ondel(callback: (deleted: Array<_BrowserStorageFileObj>) => void): void;
}
declare var browserStorageDialog: _BrowserStorageDialog;