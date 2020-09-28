'use strict'

import { format } from 'url'
import { join, parse } from 'path'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { exec } from 'child_process'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

import ButlerClient from '../public/sdk/itch/client/Client.js'
import DispatchClient from '../public/sdk/discord/client/Client.js'
import SteamClient from '../public/sdk/steam/client/Client.js'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, steamWin
let vButler, vDispatch, vSteamCMD

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    title: 'DevUI',
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: join(__dirname, 'preload.js'),
      'web-security': false
    }
  })

  win.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    win.loadURL(format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
      hash: ''
    }))
  }

  win.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });

  win.webContents.on('did-finish-load', function() {
    win.show();
  });

  win.on('closed', () => {
    win = null
  })
}

function createSteamWindow() {
  steamWin = new BrowserWindow({
    width: 600,
    height: 300,
    show: false,
    title: 'Steam',
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: join(__dirname, 'preload.js'),
      'web-security': false
    }
  })

  steamWin.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    steamWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#steam`)
  } else {
    steamWin.loadURL(format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
      hash: 'steam'
    }))
  }

  steamWin.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });

  steamWin.webContents.on('did-finish-load', function() {
    steamWin.show();
  });
  
  steamWin.on('close', (event) => {
    steamWin = null
  })
}

async function clientInit() {
  /** BUTLER */
  vButler = new ButlerClient()
  vButler.on('build-pushing', data => {
    win.webContents.send('itchBuildStarted', data)
  })
  vButler.on('build-progress', data => {
    win.webContents.send('itchBuildProgress', data)
  })
  vButler.on('build-uploaded', data => {
    win.webContents.send('itchBuildUploaded', data)
  })

  /** DISPATCH */
  vDispatch = new DispatchClient()
  vDispatch.on('build-pushing', data => {
    win.webContents.send('discordBuildStarted', data)
  })
  vDispatch.on('build-progress', data => {
    win.webContents.send('discordBuildProgress', data)
  })
  vDispatch.on('build-uploaded', data => {
    win.webContents.send('discordBuildUploaded', data)
  })

  /** STEAM */
  vSteamCMD = new SteamClient()
  vSteamCMD.on('build-pushing', data => {
    win.webContents.send('steamBuildStarted', data)
  })
  vSteamCMD.on('build-progress', data => {
    win.webContents.send('steamBuildProgress', data)
  })
  vSteamCMD.on('build-uploaded', data => {
    win.webContents.send('steamBuildUploaded', data)
  })
}
clientInit()
// console.log(process.env.BASE_PATH)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('confirmDelete', async (e, app) => {
  let { response } = await dialog.showMessageBox({
    title: `Delete ${app.name}`,
    type: 'warning',
    message: `Are you sure you want to delete ${app.name}?`,
    buttons: ["Yes","No"]
  })
  e.returnValue = response === 0
})

ipcMain.on('appDirectory', async (e, app) => {
  let { canceled, filePaths } = await dialog.showOpenDialog({
    title: `Choose Directory for ${app.name}`,
    properties: [
      'openDirectory',
      'createDirectory'
    ]
  })
  
  e.returnValue = canceled ? null : filePaths[0]
})

ipcMain.on('openDialog', async (e, options) => {
  let properties = []
  if (options.isFolder) {
    properties.push('openDirectory')
    properties.push('createDirectory')
  } else {
    properties.push('openFile')
  }

  let { canceled, filePaths } = await dialog.showOpenDialog({
    title: options.title,
    type: options.dialogType || 'none',
    properties
  })
  e.returnValue = canceled ? null : filePaths[0]
})

ipcMain.on('openDirectory', (e, options) => {
  if (options.isFolder) {
    exec(`start "" "${ options.dir }"`)
  } else {
    exec(`start "" "${ parse(options.dir).dir }"`)
  }
})

ipcMain.on('itchGetLogin', _ => {
  win.webContents.send('itchGetLogin', vButler.loggedIn)
})

ipcMain.on('itchLogin', async _ => {
  await vButler.login()
  win.webContents.send('itchGetLogin', vButler.loggedIn)
})

ipcMain.on('itchLogout', async _ => {
  await vButler.logout()
  win.webContents.send('itchGetLogin', vButler.loggedIn)
})

ipcMain.on('buildItch', (e, app) => {
  let option = app.options['ITCH']
  if (!option || !option.active) return

  let arches = []
  if (option['arch-win']) arches.push('win')
  if (option['arch-osx']) arches.push('osx')
  if (option['arch-linux']) arches.push('linux')

  vButler.push(app.dir, option.id, arches).catch(e => {
    console.error(e)
  })
})

ipcMain.on('discordGetLogin', _ => {
  win.webContents.send('discordGetLogin', vDispatch.loggedIn)
})

ipcMain.on('discordLogout', async _ => {
  await vDispatch.logout()
  win.webContents.send('discordGetLogin', vDispatch.loggedIn)
})

ipcMain.on('discordLogin', async _ => {
  await vDispatch.login()
  win.webContents.send('discordGetLogin', vDispatch.loggedIn)
})

ipcMain.on('buildDiscord', (e, app) => {
  let option = app.options['DISCORD']
  if (!option || !option.active) return

  vDispatch.push(app.dir, option.id, option.configFile).catch(e => {
    console.error(e)
  })
})

ipcMain.on('buildSteam', (e, app) => {
  let option = app.options['STEAM']
  if (!option || !option.active) return

  createSteamWindow()
  steamWin.webContents.send('clear')
  steamWin.webContents.send('gameId', option.id)
  steamWin.webContents.send('buildFile', option.buildFile)
})

ipcMain.on('steamLoginBuild', (e, {gameId, username, password, code, buildFile}) => {
  steamWin.close()
  vSteamCMD.push(gameId, username, password, code, buildFile)
})