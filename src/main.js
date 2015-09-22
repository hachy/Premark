import { resolve, basename } from 'path'
import app from 'app'
import BrowserWindow from 'browser-window'
import ipc from 'ipc'
import reporter from 'crash-reporter'
import emitter from './eventemitter'
import MyMenu from './menu'

reporter.start()

const appName = app.getName()

class Main {
  constructor() {
    this.mainWindow = null

    this.ipcErr = this.ipcErr.bind(this)
    this.openWhenExisting = this.openWhenExisting.bind(this)
    this.openFromMenu = this.openFromMenu.bind(this)

    app.on('ready', this.onReady.bind(this))
    ipc.on('err', this.ipcErr)
    app.on('open-file', this.openWhenExisting)
    app.on('window-all-closed', this.quit)
    emitter.on('openFromMenu', this.openFromMenu)
  }

  onReady() {
    this.menu = new MyMenu()
    this.mainWindow = new BrowserWindow({ width: 800, height: 600 })
    this.mainWindow.loadUrl(`file://${__dirname}/index.html`)

    if (process.argv.length >= 2) {
      const filepath = process.argv[process.argv.length - 1]
      this.mainWindow.webContents.on('did-finish-load', () => {
        this.setWinTitle(filepath)
        this.mainWindow.webContents.send('open-md', filepath)
      })
    } else if (process.argv.length <= 1) {
      const readme = resolve(__dirname, '..', 'README.md')
      this.mainWindow.webContents.on('did-finish-load', () => {
        this.mainWindow.webContents.send('read-md', readme)
      })
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  ipcErr(event, arg) {
    const readme = resolve(__dirname, '..', 'README.md')
    this.mainWindow.setTitle(appName)
    this.mainWindow.webContents.send('read-md', readme)
  }

  openWhenExisting(event, filepath) {
    event.preventDefault()
    this.mainWindow.webContents.send('open-md', filepath)
  }

  quit() {
    app.quit()
  }

  openFromMenu(filepath) {
    this.setWinTitle(filepath)
    this.mainWindow.webContents.send('open-md', filepath)
  }

  setWinTitle(fn) {
    const title = basename(fn)
    this.mainWindow.setTitle(`${title} - ${appName}`)
  }
}

global.main = new Main()
