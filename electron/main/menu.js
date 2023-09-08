import pkg from '../../package.json';

// let isWin = process.platform === 'win32';
let isOsx = process.platform === 'darwin';
let isFullScreen = false;

export const menu = (mainWindow, app) => [
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
      // {
        // label: 'Check for updates',
        // accelerator: !isOsx ? 'Ctrl+U' : 'Cmd+U',
        // click() {
        //     checkForUpdates();
        // }
      // },
      {
        type: 'separator',
      },
      {
        label: 'Quit xChat',
        accelerator: !isOsx ? 'Alt+Q' : 'Command+Q',
        selector: 'terminate:',
        click() {
          mainWindow = null;
          app.quit();
        },
      },
    ],
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'New Chat',
        accelerator: !isOsx ? 'Ctrl+N' : 'Cmd+N',
        click() {
          mainWindow.show();
          mainWindow.webContents.send('show-newchat');
        },
      },
      {
        label: 'Search...',
        accelerator: !isOsx ? 'Ctrl+F' : 'Cmd+F',
        click() {
          mainWindow.show();
          mainWindow.webContents.send('show-search');
        },
      },
      {
        label: 'Batch Send Message',
        accelerator: !isOsx ? 'Ctrl+B' : 'Cmd+B',
        click() {
          mainWindow.show();
          mainWindow.webContents.send('show-batchsend');
        },
      },
      // {
      //   type: 'separator',
      // },
      // {
      //   label: 'Insert emoji',
      //   accelerator: !isOsx ? 'Ctrl+I' : 'Cmd+I',
      //   click() {
      //     mainWindow.show();
      //     mainWindow.webContents.send('show-emoji');
      //   },
      // },
      // {
      //   type: 'separator',
      // },
      // {
      //   label: 'Next conversation',
      //   accelerator: !isOsx ? 'Ctrl+J' : 'Cmd+J',
      //   click() {
      //     mainWindow.show();
      //     mainWindow.webContents.send('show-next');
      //   },
      // },
      // {
      //   label: 'Previous conversation',
      //   accelerator: !isOsx ? 'Ctrl+K' : 'Cmd+K',
      //   click() {
      //     mainWindow.show();
      //     mainWindow.webContents.send('show-previous');
      //   },
      // },
    ],
  },
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
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
      {
        role: 'pasteandmatchstyle',
      },
      {
        role: 'delete',
      },
      {
        role: 'selectall',
      },
    ],
  },
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
      // {
      //   label: 'Toggle Conversations',
      //   accelerator: !isOsx ? 'Ctrl+Shift+M' : 'Shift+Cmd+M',
      //   click() {
      //     mainWindow.show();
      //     mainWindow.webContents.send('show-conversations');
      //   },
      // },
      {
        type: 'separator',
      },
      {
        role: 'toggledevtools',
      },
    ],
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
      },
      {
        role: 'close',
      },
    ],
  },
  // {
  //   role: 'help',
  //   submenu: [
  //     {
  //       label: '反馈(不一定解决)',
  //       click() {
  //         shell.openExternal('https://github.com/xYx-c/xchat/issues');
  //       },
  //     },
  //     {
  //       label: 'Fork me on Github',
  //       click() {
  //         shell.openExternal('https://github.com/xYx-c/xchat');
  //       },
  //     },
  //   ],
  // },
];
export const tMenu = (mainWindow, app) => [
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
      shell.openExternal('https://github.com/xYx-c/xchat');
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
  // {
  //   label: 'Hide menu bar icon',
  //   click() {
  //     mainWindow.webContents.send('hide-tray');
  //   },
  // },
  {
    type: 'separator',
  },
  {
    label: 'Quit xChat',
    accelerator: !isOsx ? 'Alt+Q' : 'Command+Q',
    selector: 'terminate:',
    click() {
      mainWindow = null;
      app.quit();
    },
  },
];
