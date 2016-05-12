var fs = require('fs');
var remote = require('electron').remote;
var app = remote.app;
var dialog = remote.require('electron').dialog;
var browserWindow = remote.BrowserWindow;
var FocusedWindow = browserWindow.getFocusedWindow();
var packagejson = require('./package.json');
var recentFile = require('./browser/recentFile');

var OPEN_FILE_PATH = "";
var MODIFY = false;

// ドロップ
window.addEventListener('drop', function(e) {
    e.preventDefault();

    // File API ファイルオブジェクトを取得
    var file = e.dataTransfer.files[0];

    // MIMEタイプをチェック
    if ( file.type === "text/plain" || file.type === "application/text" ||
         file.name.split(".")[1] === "txt" || file.name.split(".")[1] === "md"
    ) {
        // 編集中
        if (MODIFY) {
            chooseSave();
        }
        if (!MODIFY) {
            openFile(file.path);
        }
    } else {
        basicModalAlert("This file format is not supported.");
    }

    return false;
}, true);

function setWindowTitle(path) {
    if (path) {
        FocusedWindow.setTitle(path +" - " + packagejson.name);
    } else {
        FocusedWindow.setTitle(packagejson.name);
    }
}

function newFile() {
    // 新規ファイルで未編集
    if (!MODIFY && !OPEN_FILE_PATH) {
        return;
    }

    // 編集中
    if (MODIFY) {
        chooseSave();
    }

    // 編集中でない場合は初期化
    if (!MODIFY) {
        OPEN_FILE_PATH = "";
        setWindowTitle('');
        var doc = window.editor.getDoc();
        doc.setValue("");
        doc.clearHistory();
    }
}

function chooseSave() {
    var response = dialogCloseModifyFile();

    switch (response) {
        case 0: // Yes
            // 既存ファイルの保存
            if (OPEN_FILE_PATH) {
                save();
            } else {
                dialogSaveAs();
            }
            break;
        case 1: // No
            // 保存しない
            MODIFY = false;
            break;
        case 2: // Cancel
            // スルー
            break;
    }
}

function openFile(path) {
    if (OPEN_FILE_PATH === path) {
        basicModalAlert("This file is already open.");
    } else {
        fs.readFile(path, 'utf8', function(err, content) {
            if (err !== null) {
                basicModalAlert('error: ' + err);
            } else {
                setWindowTitle(path);
                var doc = window.editor.getDoc();
                doc.setValue(content);
                doc.clearHistory();
                MODIFY = false;
                OPEN_FILE_PATH = path;
                recentFile.set(path);
                snackLoad();
            }
        });
    }
}

function save(path, data) {
    // 未編集の場合はお帰り願う
    if (!MODIFY) {
        return;
    }
    fs.writeFile(path, data, function(err) {
        if (err !== null) {
            basicModalAlert('error: ' + err);
        } else {
            MODIFY = false;
            OPEN_FILE_PATH = path;  // for new file
            setWindowTitle(path);   // for new file
            snackSave();
        }
    });
}

function saveFile() {
    if (OPEN_FILE_PATH) {
        var data =  window.editor.getValue();
        save(OPEN_FILE_PATH, data);
    } else {
        dialogSaveAs();
    }
}

function saveAsFile(path) {
    var data = window.editor.getValue();
    save(path, data);
}

function basicModalAlert(str) {
    basicModal.show({
        body: "<p>"+ str +"</p>",
        buttons: {
            action: {
                title: 'OK',
                fn: basicModal.close
            }
        }
    });
}

function snackLoad() {
    window.app.$broadcast('fileOperation', {
        message: 'Document loaded.',
        timeout: 1000,
    });
}

function snackSave() {
    window.app.$broadcast('fileOperation', {
        message: 'Document saved.',
        timeout: 1000,
        // actionText: '',
        // actionHandler: function(e) {
        //     console.log(e);
        // },
    });
}
