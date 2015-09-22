import Menu from 'menu'
import dialog from 'dialog'
import app from 'app'
import emitter from './eventemitter'

const appName = app.getName()

export default class MyMenu {
  build() {
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
                emitter.emit('openFromMenu', filepath)
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
    return template
  }

  constructor() {
    const menu = Menu.buildFromTemplate(this.build())
    Menu.setApplicationMenu(menu)
  }
}
