import { readFile, watchFile }from 'fs'
import { stderr } from 'process'
import ipc from 'ipc'
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
  readFile(filepath, 'utf-8', (err, data) => {
    if (err) {
      stderr.write(`No such file or directory:  ${filepath}`)
      ipc.send('err', 'error')
      return
    }
    document.getElementById('markdown').innerHTML = marked(data)
  })
}

function watch(filepath) {
  watchFile(filepath, { interval: 10 }, () => {
    read(filepath)
  })
}
