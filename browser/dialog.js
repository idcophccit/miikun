var fs = require('fs');
var remote = require('electron').remote;
var app = remote.app;
var dialog = remote.require('electron').dialog;
var browserWindow = remote.BrowserWindow;
var FocusedWindow = browserWindow.getFocusedWindow();
var packagejson = require('./package.json');

function dialogOpenFile() {
    dialog.showOpenDialog(FocusedWindow, {
        title: 'Open Dialog',
        filters: [
            {name: 'Documents', extensions: ['txt', 'md']},
        ],
        properties: ['openFile']
    }, function (item) {
        if (item) {
            openFile(item[0]);
        }
    });
}

function dialogSaveAs() {
    dialog.showSaveDialog(FocusedWindow, {
        title: 'Save Dialog',
        filters: [
            {name: 'Markdown file', extensions: ['md']},
            {name: 'Text file', extensions: ['txt']},
        ],
    }, function (item) {
        if (item) {
            saveAsFile(item);
        }
    });
}

function dialogAbout() {
    var iconPath = __dirname +'/about.png';
    dialog.showMessageBox(FocusedWindow, {
        title: 'About',
        type: 'none',
        icon: iconPath.toString(),
        buttons: ['OK'],
        detail: packagejson.name + "\n" + packagejson.version + "\n" + packagejson.description
    });
}

function dialogCloseModifyFile() {
    var response = 0;

    // 同期
    response = dialog.showMessageBox(FocusedWindow, {
        title: packagejson.name,
        type: 'warning',
        buttons: ['Yes', 'No', 'Cancel'],
        detail: "Wolud you like to save changes?",
    });

    return response;
}
