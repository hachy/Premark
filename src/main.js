'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var path = require('path');
var ipc = require('ipc');

require('crash-reporter').start();

var mainWindow = null;
var appName = app.getName();

app.on('window-all-closed', function() {
  app.quit();
});

ipc.on('err', function(event, arg) {
  var readme = path.resolve(__dirname, '..', 'README.md');
  mainWindow.setTitle(appName);
  mainWindow.webContents.send('read-md', readme);
});

app.on('ready', function() {
  Menu.setApplicationMenu(menu);
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  if (process.argv.length >= 2) {
    var filepath = process.argv[process.argv.length - 1];
    mainWindow.webContents.on('did-finish-load', function() {
      setWinTitle(filepath);
      mainWindow.webContents.send('open-md', filepath);
    });
  } else if (process.argv.length <= 1) {
    var readme = path.resolve(__dirname, '..', 'README.md');
    mainWindow.webContents.on('did-finish-load', function() {
      mainWindow.webContents.send('read-md', readme);
    });
  }

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

app.on('open-file', function(event, filepath) {
  event.preventDefault();
  mainWindow.webContents.send('open-md', filepath);
});

function setWinTitle(fn) {
  var title = path.basename(fn);
  mainWindow.setTitle(title + ' - ' + appName);
}

var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'Command+O',
        click: function() {
          require('dialog').showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'All Files', extensions: ['markdown', 'md']}]
          }, function(filenames) {
            if (!filenames || !filenames[0]) {
              return;
            }
            var filepath = filenames[0];
            setWinTitle(filepath);
            mainWindow.webContents.send('open-md', filepath);
          });
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: appName,
    submenu: [
      {
        label: 'About ' + appName,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      }
    ]
  });
}

var menu = Menu.buildFromTemplate(template);
