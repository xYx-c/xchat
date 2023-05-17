import { app, powerMonitor, BrowserWindow, Tray, Menu, ipcMain, clipboard, shell, nativeImage } from 'electron';
import fs from 'fs';
import tmp from 'tmp';
import { release } from 'node:os';
import { join } from 'node:path';
import { update } from './update';
import axios from 'axios';
import pkg from '../../package.json';

const ElectronStore = require('electron-store');
ElectronStore.initRenderer();

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let mainWindow = null;
let forceQuit = false;
let downloading = false;
let tray;
let settings = {};
let isFullScreen = false;
let isWin = process.platform === 'win32';
let isOsx = process.platform === 'darwin';
let isSuspend = false;
let userData = app.getPath('userData');
let imagesCacheDir = `${userData}/images`;
let voicesCacheDir = `${userData}/voices`;
let avatarPath = tmp.dirSync();
let avatarCache = {};
let avatarPlaceholder = `${__dirname}/src/assets/images/user-fallback.png`;
const icon = `${__dirname}/src/assets/images/dock.png`;

const mainMenu = [
  {
    label: pkg.name,
    submenu: [
      {
        label: `About ${pkg.name}`,
        selector: 'orderFrontStandardAboutPanel:',
      },
      {
        label: 'Preferences...',
        accelerator: !isOsx ? 'Ctrl+,' : 'Cmd+,',
        click() {
          mainWindow.show();
          mainWindow.webContents.send('show-settings');
        },
      },
      {
        label: 'messageInput',
        accelerator: 'Esc',
        click() {
          mainWindow.show();
          mainWindow.webContents.send('show-messageInput');
        },
      },
      {
        type: 'separator',
      },
      {
        role: 'hide',
      },
      {
        role: 'hideothers',
      },
      {
        role: 'unhide',
      },
      {
        label: 'Check for updates',
        accelerator: !isOsx ? 'Ctrl+U' : 'Cmd+U',
        // click() {
        //     checkForUpdates();
        // }
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit weweChat',
        accelerator: !isOsx ? 'Alt+Q' : 'Command+Q',
        selector: 'terminate:',
        click() {
          forceQuit = true;
          mainWindow = null;
          app.quit();
        },
      },
    ],
  },
  // {
  //   label: 'File',
  //   submenu: [
  //     {
  //       label: 'New Chat',
  //       accelerator: !isOsx ? 'Ctrl+N' : 'Cmd+N',
  //       click() {
  //         mainWindow.show();
  //         mainWindow.webContents.send('show-newchat');
  //       },
  //     },
  //     {
  //       label: 'Search...',
  //       accelerator: !isOsx ? 'Ctrl+F' : 'Cmd+F',
  //       click() {
  //         mainWindow.show();
  //         mainWindow.webContents.send('show-search');
  //       },
  //     },
  //     {
  //       label: 'Batch Send Message',
  //       accelerator: !isOsx ? 'Ctrl+B' : 'Cmd+B',
  //       click() {
  //         mainWindow.show();
  //         mainWindow.webContents.send('show-batchsend');
  //       },
  //     },
  //     {
  //       type: 'separator',
  //     },
  //     {
  //       label: 'Insert emoji',
  //       accelerator: !isOsx ? 'Ctrl+I' : 'Cmd+I',
  //       click() {
  //         mainWindow.show();
  //         mainWindow.webContents.send('show-emoji');
  //       },
  //     },
  //     {
  //       type: 'separator',
  //     },
  //     {
  //       label: 'Next conversation',
  //       accelerator: !isOsx ? 'Ctrl+J' : 'Cmd+J',
  //       click() {
  //         mainWindow.show();
  //         mainWindow.webContents.send('show-next');
  //       },
  //     },
  //     {
  //       label: 'Previous conversation',
  //       accelerator: !isOsx ? 'Ctrl+K' : 'Cmd+K',
  //       click() {
  //         mainWindow.show();
  //         mainWindow.webContents.send('show-previous');
  //       },
  //     },
  //   ],
  // },
  // {
  //   label: 'Conversations',
  //   submenu: [
  //     {
  //       label: 'Loading...',
  //     },
  //   ],
  // },
  // {
  //   label: 'Contacts',
  //   submenu: [
  //     {
  //       label: 'Loading...',
  //     },
  //   ],
  // },
  // {
  //   label: 'Edit',
  //   submenu: [
  //     {
  //       role: 'undo',
  //     },
  //     {
  //       role: 'redo',
  //     },
  //     {
  //       type: 'separator',
  //     },
  //     {
  //       role: 'cut',
  //     },
  //     {
  //       role: 'copy',
  //     },
  //     {
  //       role: 'paste',
  //     },
  //     {
  //       role: 'pasteandmatchstyle',
  //     },
  //     {
  //       role: 'delete',
  //     },
  //     {
  //       role: 'selectall',
  //     },
  //   ],
  // },
  {
    label: 'View',
    submenu: [
      {
        label: isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen',
        accelerator: !isOsx ? 'Ctrl+Shift+F' : 'Shift+Cmd+F',
        click() {
          isFullScreen = !isFullScreen;

          mainWindow.show();
          mainWindow.setFullScreen(isFullScreen);
        },
      },
      {
        label: 'Toggle Conversations',
        accelerator: !isOsx ? 'Ctrl+Shift+M' : 'Shift+Cmd+M',
        click() {
          mainWindow.show();
          mainWindow.webContents.send('show-conversations');
        },
      },
      {
        type: 'separator',
      },
      {
        label: '',
      },
      {
        type: 'separator',
      },
      {
        role: 'toggledevtools',
      },
      {
        role: 'togglefullscreen',
      },
    ],
  },
  // {
  //   role: 'window',
  //   submenu: [
  //     {
  //       role: 'minimize',
  //     },
  //     {
  //       role: 'close',
  //     },
  //   ],
  // },
  // {
  //   role: 'help',
  //   submenu: [
  //     {
  //       label: '反馈(不一定解决)',
  //       click() {
  //         shell.openExternal('https://github.com/Riceneeder/weweChat/issues');
  //       },
  //     },
  //     {
  //       label: 'Fork me on Github',
  //       click() {
  //         shell.openExternal('https://github.com/Riceneeder/weweChat');
  //       },
  //     },
  //   ],
  // },
];
const trayMenu = [
  {
    label: `You have 0 messages`,
    click() {
      mainWindow.show();
      mainWindow.webContents.send('show-messages');
    },
  },
  {
    label: 'Toggle main window',
    click() {
      let isVisible = mainWindow.isVisible();
      isVisible ? mainWindow.hide() : mainWindow.show();
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Preferences...',
    accelerator: !isOsx ? 'Ctrl+,' : 'Cmd+,',
    click() {
      mainWindow.show();
      mainWindow.webContents.send('show-settings');
    },
  },
  {
    label: 'Fork me on Github',
    click() {
      shell.openExternal('https://github.com/Riceneeder/weweChat');
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Toggle DevTools',
    accelerator: !isOsx ? 'Ctrl+Alt+I' : 'Alt+Command+I',
    click() {
      mainWindow.show();
      mainWindow.toggleDevTools();
    },
  },
  {
    label: 'Hide menu bar icon',
    click() {
      mainWindow.webContents.send('hide-tray');
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Check for updates',
    accelerator: !isOsx ? 'Ctrl+U' : 'Cmd+U',
    // click() {
    //     checkForUpdates();
    // }
  },
  {
    label: 'Quit weweChat',
    accelerator: !isOsx ? 'Alt+Q' : 'Command+Q',
    selector: 'terminate:',
    click() {
      forceQuit = true;
      mainWindow = null;
      app.quit();
    },
  },
];

async function getIcon(cookies, userid, src) {
  var cached = avatarCache[userid];
  var icon;

  if (cached) {
    return cached;
  }

  if (cookies && src) {
    try {
      let response = await axios({
        url: src,
        method: 'get',
        responseType: 'arraybuffer',
        headers: {
          Cookie: cookies,
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8',
        },
      });
      // eslint-disable-next-line
      let base64 = new Buffer(response.data, 'binary').toString('base64');

      icon = `${avatarPath.name}/${userid}.jpg`;
      fs.writeFileSync(icon, base64.replace(/^data:image\/png;base64,/, ''), 'base64');
    } catch (ex) {
      console.error(ex);
      icon = avatarPlaceholder;
    }
  }

  var image = nativeImage.createFromPath(icon);

  image = image.resize({ width: 24, height: 24 });

  avatarCache[userid] = image;

  return image;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Main window',
    // icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      webSecurity: false,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  require('@electron/remote/main').initialize();
  require('@electron/remote/main').enable(mainWindow.webContents);
  if (url) {
    // electron-vite-vue#298
    mainWindow.loadURL(url);
    // Open devTool if the app is not packaged
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Apply electron-updater
  update(mainWindow);
  createMenu();
}

const createMainWindow = () => {
  // var mainWindowState = windowStateKeeper({
  //   defaultWidth: 745,
  //   defaultHeight: 450,
  // });

  // mainWindow = new BrowserWindow({
  //   // x: mainWindowState.x,
  //   // y: mainWindowState.y,
  //   minWidth: 745,
  //   minHeight: 450,
  //   transparent: true,
  //   titleBarStyle: 'hiddenInset',
  //   backgroundColor: 'none',
  //   resizable: true,
  //   webPreferences: {
  //     scrollBounce: true,
  //   },
  //   frame: !isWin,
  //   icon,
  // });

  mainWindow = new BrowserWindow({
    minWidth: 745,
    minHeight: 450,
    transparent: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: 'none',
    resizable: true,
    icon,
    frame: !isWin,
    title: 'Main window',
    // icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      // webSecurity: false,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    { urls: ['https://login.wx.qq.com/'] },
    (details, callback) => {
      details.requestHeaders['Origin'] = 'https://login.wx.qq.com/';

      if (details.responseHeaders && details.responseHeaders['Set-Cookie']) {
        for (let i = 0; i < details.responseHeaders['Set-Cookie'].length; i++) {
          details.responseHeaders['Set-Cookie'][i] += ';SameSite=None;Secure';
        }
      }
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    },
  );
  // mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       'Access-Control-Allow-Origin': ['*'],
  //       ...details.responseHeaders,
  //     },
  //   });
  // });
  require('@electron/remote/main').initialize();
  require('@electron/remote/main').enable(mainWindow.webContents);
  if (url) {
    // electron-vite-vue#298
    mainWindow.loadURL(url);
    // Open devTool if the app is not packaged
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexHtml);
  }
  mainWindow.webContents.openDevTools();

  // Test actively push message to the Electron-Renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Apply electron-updater
  update(mainWindow);
  createMenu();

  // mainWindow.setSize(350, 460);
  mainWindow.webContents.on('did-finish-load', () => {
    try {
      mainWindow.show();
      mainWindow.focus();
    } catch (ex) { }
  });

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.on('close', e => {
    if (forceQuit) {
      mainWindow = null;
      app.quit();
    } else {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  ipcMain.on('settings-apply', (event, args) => {
    settings = args.settings;
    mainWindow.setAlwaysOnTop(!!settings.alwaysOnTop);

    try {
      updateTray();
      autostart();
    } catch (ex) {
      console.error(ex);
    }
  });

  ipcMain.on('show-window', event => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.on('menu-update', async (event, args) => {
    var { cookies, contacts = [], conversations = [] } = args;
    var conversationsMenu = mainMenu.find(e => e.label === 'Conversations');
    var contactsMenu = mainMenu.find(e => e.label === 'Contacts');
    var shouldUpdate = false;

    // if (!isOsx) {
    //     return;
    // }

    if (
      conversations.length &&
      conversations.map(e => e.name).join() !== conversationsMenu.submenu.map(e => e.label).join()
    ) {
      shouldUpdate = true;

      conversations = await Promise.all(
        conversations.map(async (e, index) => {
          let icon = await getIcon(cookies, e.id, e.avatar);

          return {
            label: e.name,
            accelerator: !isOsx ? `Ctrl+${index}` : `Cmd+${index}`,
            icon,
            click() {
              mainWindow.show();
              mainWindow.webContents.send('message-chatto', {
                id: e.id,
              });
            },
          };
        }),
      );
      conversationsMenu.submenu = conversations;
    }
    if (contacts.length) {
      shouldUpdate = true;

      contacts = await Promise.all(
        contacts.map(async e => {
          let icon = await getIcon(cookies, e.id, e.avatar);

          return {
            label: e.name,
            icon,
            click() {
              mainWindow.show();
              mainWindow.webContents.send('show-userinfo', {
                id: e.id,
              });
            },
          };
        }),
      );
      contactsMenu.submenu = contacts;
    }

    if (shouldUpdate) {
      createMenu();
    }
  });

  ipcMain.on('message-unread', (event, args) => {
    var counter = args.counter;

    if (settings.showOnTray) {
      updateTray(counter);
    }
  });

  ipcMain.on('file-paste', event => {
    var image = clipboard.readImage();
    var args = { hasImage: false };

    if (!image.isEmpty()) {
      let filename = tmp.tmpNameSync() + '.png';

      args = {
        hasImage: true,
        filename,
        raw: image.toPNG(),
      };

      fs.writeFileSync(filename, image.toPNG());
    }

    event.returnValue = args;
  });

  ipcMain.on('file-download', async (event, args) => {
    var filename = args.filename;

    fs.writeFileSync(filename, args.raw.replace(/^data:image\/png;base64,/, ''), {
      encoding: 'base64',
      // Overwrite file
      flag: 'wx',
    });
    event.returnValue = filename;
  });

  ipcMain.on('open-file', async (event, filename) => {
    shell.openItem(filename);
  });

  ipcMain.on('open-folder', async (event, dir) => {
    shell.openItem(dir);
  });

  ipcMain.on('open-map', (event, args) => {
    event.preventDefault();
    shell.openExternal(args.map);
  });

  ipcMain.on('open-image', async (event, args) => {
    var filename = `${imagesCacheDir}/img_${args.dataset.id}`;

    fs.writeFileSync(filename, args.base64.replace(/^data:image\/png;base64,/, ''), 'base64');
    shell.openItem(filename);
  });

  ipcMain.on('is-suspend', (event, args) => {
    event.returnValue = isSuspend;
  });

  ipcMain.once('logined', event => {
    mainWindow.setResizable(true);
    // mainWindow.setSize(mainWindowState.width, mainWindowState.height);
    // mainWindowState.manage(mainWindow);
  });

  powerMonitor.on('resume', () => {
    isSuspend = false;
    mainWindow.webContents.send('os-resume');
  });

  powerMonitor.on('suspend', () => {
    isSuspend = true;
  });

  if (isOsx) {
    app.setAboutPanelOptions({
      applicationName: pkg.name,
      applicationVersion: pkg.version,
      copyright:
        'Made with 💖 by trazyn. \n https://github.com/trazyn/weweChat \nRevise By Riceneeder \n https://github.com/Riceneeder/weweChat',
      credits: `With the invaluable help of: \n web.wechat.com`,
      version: pkg.version,
    });
  }

  [imagesCacheDir, voicesCacheDir].map(e => {
    if (!fs.existsSync(e)) {
      fs.mkdirSync(e);
    }
  });

  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8',
  );
  createMenu();
};

function updateTray(unread = 0) {
  if (!isOsx) {
    // Always show the tray icon on windows
    settings.showOnTray = true;
  }

  // Update unread mesage count
  trayMenu[0].label = `You have ${unread} messages`;

  if (settings.showOnTray) {
    if (tray && updateTray.lastUnread === unread) {
      return;
    }

    let contextmenu = Menu.buildFromTemplate(trayMenu);
    let icon = unread
      ? `${__dirname}/src/assets/images/icon-new-message.png`
      : `${__dirname}/src/assets/images/icon.png`;
    // Make sure the last tray has been destroyed
    setTimeout(() => {
      if (!tray) {
        // Init tray icon
        tray = new Tray(icon);

        tray.on('right-click', () => {
          tray.popUpContextMenu();
        });

        let clicked = false;
        tray.on('click', () => {
          if (clicked) {
            mainWindow.show();
            clicked = false;
          } else {
            clicked = true;
            setTimeout(() => {
              clicked = false;
            }, 400);
          }
        });
      }

      tray.setImage(icon);
      tray.setContextMenu(contextmenu);
    });
  } else {
    if (!tray) return;

    tray.destroy();
    tray = null;
  }

  // Avoid tray icon been recreate
  updateTray.lastUnread = unread;
}

async function autostart() {
  var launcher = new AutoLaunch({
    name: 'weweChat',
    path: '/Applications/wewechat.app',
  });

  if (settings.startup) {
    if (!isOsx) {
      mainWindow.webContents.send('show-errors', {
        message: 'Currently only supports the OSX.',
      });
      return;
    }

    launcher.enable().catch(ex => {
      console.error(ex);
    });
  } else {
    launcher.disable();
  }
}

function createMenu() {
  var menu = Menu.buildFromTemplate(mainMenu);
  if (isOsx) {
    Menu.setApplicationMenu(menu);
  } else {
    mainWindow.setMenu(menu);
  }
}

app.dock && app.dock.setIcon(icon);

app.on('before-quit', () => {
  // Fix issues #14
  forceQuit = true;
});
app.on('activate', e => {
  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
});

// autoUpdater.on('update-not-available', e => {
//     dialog.showMessageBox({
//         type: 'info',
//         buttons: ['OK'],
//         title: pkg.name,
//         message: `${pkg.name} is up to date :)`,
//         detail: `${pkg.name} ${pkg.version} is currently the newest version available, It looks like you're already rocking the latest version!`
//     });
//
//     console.log('Update not available.');
// });

// autoUpdater.on('update-available', e => {
//     downloading = true;
//     checkForUpdates();
// });

// autoUpdater.on('error', err => {
//     dialog.showMessageBox({
//         type: 'error',
//         buttons: ['Cancel update'],
//         title: pkg.name,
//         message: `Failed to update ${pkg.name} :(`,
//         detail: `An error occurred in retrieving update information, Please try again later.`,
//     });
//
//     downloading = false;
//     console.error(err);
// });

// autoUpdater.on('update-downloaded', info => {
//     var { releaseNotes, releaseName } = info;
//     var index = dialog.showMessageBox({
//         type: 'info',
//         buttons: ['Restart', 'Later'],
//         title: pkg.name,
//         message: `The new version has been downloaded. Please restart the application to apply the updates.`,
//         detail: `${releaseName}\n\n${releaseNotes}`
//     });
//     downloading = false;
//
//     if (index === 1) {
//         return;
//     }
//
//     autoUpdater.quitAndInstall();
//     setTimeout(() => {
//         mainWindow = null;
//         app.quit();
//     });
// });

// app.whenReady().then(createWindow);
app.whenReady().then(createMainWindow);

// app.setName(pkg.name);
// app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
  mainWindow = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (mainWindow) {
    // Focus on the main window if the user tried to open another
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
