import ipc from 'ipc'
import process from 'process'
import fs from 'fs'
import marked from 'marked'

ipc.on('read-md', (filepath) => {
  read(filepath)
})

ipc.on('open-md', (filepath) => {
  read(filepath)
  watch(filepath)
})

marked.setOptions({
  highlight: (code) => {
    return require('highlight.js').highlightAuto(code).value
  }
})

function read(filepath) {
  fs.readFile(filepath, 'utf-8', (err, data) => {
    if (err) {
      process.stderr.write(`No such file or directory:  ${filepath}`)
      ipc.send('err', 'error')
      return
    }
    document.getElementById('markdown').innerHTML = marked(data)
  })
}

function watch(filepath) {
  fs.watchFile(filepath, { interval: 10 }, () => {
    read(filepath)
  })
}
