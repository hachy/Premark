import { readFile, watchFile } from 'fs'
import { stderr } from 'process'
import ipc from 'ipc'
import marked from 'marked'

marked.setOptions({
  highlight: (code) => {
    return require('highlight.js').highlightAuto(code).value
  }
})

class Index {
  constructor() {
    ipc.on('read-md', this.read)
    ipc.on('open-md', this.watch.bind(this))
  }

  read(filepath) {
    readFile(filepath, 'utf-8', (err, data) => {
      if (err) {
        stderr.write(`No such file or directory:  ${filepath}`)
        ipc.send('err', 'error')
        return
      }
      document.getElementById('markdown').innerHTML = marked(data)
    })
  }

  watch(filepath) {
    this.read(filepath)
    watchFile(filepath, { interval: 10 }, () => {
      this.read(filepath)
    })
  }
}

global.index = new Index()
