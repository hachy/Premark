'use strict';

var remote = require('remote');
var ipc = require('ipc');
var process = remote.require('process');
var fs = remote.require('fs');
var marked = require('marked');

ipc.on('read-md', function(filepath) {
  read(filepath);
});

ipc.on('open-md', function(filepath) {
  read(filepath);
  watch(filepath);
});

marked.setOptions({
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

function read(filepath) {
  fs.readFile(filepath, 'utf-8', function(err, data) {
    if (err) {
      process.stderr.write('No such file or directory: ' + filepath);
      ipc.send('err', 'error');
      return;
    }
    document.getElementById('markdown').innerHTML = marked(data);
  });
}

function watch(filepath) {
  fs.watchFile(filepath, { interval: 10 }, function() {
    read(filepath);
  });
}
