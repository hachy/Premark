'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var path = require('path');
var ipc = require('ipc');

require('crash-reporter').start();

var mainWindow = null;
var appName = require('app').getName();

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  Menu.setApplicationMenu(menu);
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

ipc.on('md-title', function(event, arg) {
  setWinTitle(arg);
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
