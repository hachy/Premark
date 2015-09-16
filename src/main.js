import { resolve, basename } from 'path'
import app from 'app'
import BrowserWindow from 'browser-window'
import Menu from 'menu'
import ipc from 'ipc'
import dialog from 'dialog'
import reporter from 'crash-reporter'
reporter.start()

let mainWindow = null

const appName = app.getName()

app.on('window-all-closed', () => {
  app.quit()
})

ipc.on('err', (event, arg) => {
  const readme = resolve(__dirname, '..', 'README.md')
  mainWindow.setTitle(appName)
  mainWindow.webContents.send('read-md', readme)
})

app.on('ready', () => {
  Menu.setApplicationMenu(menu)
  mainWindow = new BrowserWindow({ width: 800, height: 600 })
  mainWindow.loadUrl(`file://${__dirname}/index.html`)

  if (process.argv.length >= 2) {
    const filepath = process.argv[process.argv.length - 1]
    mainWindow.webContents.on('did-finish-load', () => {
      setWinTitle(filepath)
      mainWindow.webContents.send('open-md', filepath)
    })
  } else if (process.argv.length <= 1) {
    const readme = resolve(__dirname, '..', 'README.md')
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('read-md', readme)
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
})

app.on('open-file', (event, filepath) => {
  event.preventDefault()
  mainWindow.webContents.send('open-md', filepath)
})

function setWinTitle(fn) {
  const title = basename(fn)
  mainWindow.setTitle(`${title} - ${appName}`)
}

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'Command+O',
        click: () => {
          dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'All Files', extensions: ['markdown', 'md']}]
          }, (filenames) => {
            if (!filenames || !filenames[0]) {
              return
            }
            const filepath = filenames[0]
            setWinTitle(filepath)
            mainWindow.webContents.send('open-md', filepath)
          })
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
]

if (process.platform === 'darwin') {
  template.unshift({
    label: appName,
    submenu: [
      {
        label: `About ${appName}`,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => { app.quit() }
      }
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
