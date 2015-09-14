'use strict';

var remote = require('remote');
var ipc = require('ipc');
var process = remote.require('process');
var fs = remote.require('fs');
var path = remote.require('path');
var marked = require('marked');

if (process.argv.length >= 3) {
  openFromCLI();
} else if (process.argv.length <= 2) {
  read(path.resolve(__dirname, '..', 'README.md'));
}

ipc.on('open-md', function(filepath) {
  read(filepath);
  watch(filepath);
});

marked.setOptions({
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});


function openFromCLI() {
  var filepath = process.argv[process.argv.length - 1];
  ipc.send('md-title', filepath);
  read(filepath);
  watch(filepath);
}

function read(filepath) {
  fs.readFile(filepath, 'utf-8', function(err, data) {
    if (err) {
      process.stderr.write('No such file or directory: ' + filepath);
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
