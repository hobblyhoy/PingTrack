/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { Host, SettingsUpdate, PingResponse, PingResponseDecorated } from './types';
var ping = require('ping');

export default class AppUpdater {
   constructor() {
      log.transports.file.level = 'info';
      autoUpdater.logger = log;
      autoUpdater.checkForUpdatesAndNotify();
   }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
   const sourceMapSupport = require('source-map-support');
   sourceMapSupport.install();
}

if (
   process.env.NODE_ENV === 'development' ||
   process.env.DEBUG_PROD === 'true'
) {
   require('electron-debug')();
}

const installExtensions = async () => {
   const installer = require('electron-devtools-installer');
   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
   const extensions = ['REACT_DEVELOPER_TOOLS'];

   return Promise.all(
      extensions.map((name) => installer.default(installer[name], forceDownload))
   ).catch(console.log);
};

const createWindow = async () => {
   if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
   ) {
      await installExtensions();
   }

   mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      webPreferences:
         (process.env.NODE_ENV === 'development' ||
            process.env.E2E_BUILD === 'true') &&
            process.env.ERB_SECURE !== 'true'
            ? {
               nodeIntegration: true,
            }
            : {
               preload: path.join(__dirname, 'dist/renderer.prod.js'),
            },
   });

   mainWindow.loadURL(`file://${__dirname}/app.html`);

   // @TODO: Use 'ready-to-show' event
   //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
   mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) {
         throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
         mainWindow.minimize();
      } else {
         mainWindow.show();
         mainWindow.focus();
      }
   });

   mainWindow.on('closed', () => {
      mainWindow = null;
   });

   const menuBuilder = new MenuBuilder(mainWindow);
   menuBuilder.buildMenu();

   // Remove this if your app does not use auto updates
   // eslint-disable-next-line
   new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
   // Respect the OSX convention of having the application in memory even
   // after all windows have been closed
   if (process.platform !== 'darwin') {
      app.quit();
   }
});

if (process.env.E2E_BUILD === 'true') {
   // eslint-disable-next-line promise/catch-or-return
   app.whenReady().then(createWindow);
} else {
   app.on('ready', createWindow);
}

app.on('activate', () => {
   // On macOS it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (mainWindow === null) createWindow();
});




//// Server level variables \\\\
// Internal control
let updateThreadId:number = 1;
// Settings
let timeBetweenPings_ms:number = 10 * 1000; //default
// Hosts
let hosts:Host[] = [];

//something that receives any updates (including the initial launch) of the settings. 
//the logic should setup a setTimeout which runs, any updates are applied 
// then it kicks itself off again.
ipcMain.on('settingsUpdate', (event, settings:SettingsUpdate) => {
   
   // Not every update will necessarily require our loop to restart so we track it with updateRequired
   let updateRequired = false;
   if (settings.timeBetweenPings_ms > 0 && settings.timeBetweenPings_ms !== timeBetweenPings_ms) {
      timeBetweenPings_ms = settings.timeBetweenPings_ms;
      updateRequired = true;
   }

   if (updateRequired) {
      updateThreadId++;
      pingProcess(updateThreadId, false);
   }
});


//will also need something that receives updates to the hosts file and updates it
ipcMain.on('hostsUpdate', (event, newHosts:Host[]) => {
   hosts = newHosts;
});

let pingProcess = (localUpdateThreadId, calledFromLoop) => {

   const theActualWork = (isLoop) => {
      // As soon as we update settings we fire off a new batch of updates
      // this check is to make sure we dont run an old thread
      if (localUpdateThreadId === updateThreadId) {
         let startTime = (new Date()).getTime();
         hosts.filter(host => host.isEnabled && !host.isBrandNew).forEach(host => {
            ping.promise.probe(host.name, {timeout: 1000}).then((pingResponse:PingResponse) => {
               let pingResponseDecorated:PingResponseDecorated = {...pingResponse, startTime};

               // Some cleanup in the case of an invalid host
               pingResponseDecorated.host = host.name;
               pingResponseDecorated.time = !isNaN(pingResponseDecorated.time) ? pingResponseDecorated.time : null;

               mainWindow.webContents.send('pingResponse', pingResponseDecorated);
            });
         })
         if (isLoop) pingProcess(updateThreadId, true);
      }
   }
   if (!calledFromLoop) theActualWork(false); //Run a single time right away to keep the UI from feeling sluggish
   setTimeout(() => theActualWork(true), timeBetweenPings_ms);

}

pingProcess(updateThreadId, false);