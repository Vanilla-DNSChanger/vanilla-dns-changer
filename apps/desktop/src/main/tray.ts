import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import { join } from 'path';
import { AppStore, StoreSchema } from './store';

let isConnected = false;

export function createTray(mainWindow: BrowserWindow, store: AppStore): Tray {
  // Create tray icon
  const iconPath = join(__dirname, '../../public/logo.svg');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  
  const tray = new Tray(icon);
  tray.setToolTip('Vanilla DNS Changer');

  // Update context menu
  updateTrayMenu(tray, mainWindow);

  // Click to show window
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  return tray;
}

export function updateTrayMenu(tray: Tray, mainWindow: BrowserWindow) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Vanilla DNS Changer',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isConnected ? '🟢 Connected' : '⚪ Disconnected',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Quick Connect',
      submenu: [
        {
          label: 'Google DNS',
          click: () => {
            mainWindow.webContents.send('tray:quick-connect', 'google');
          },
        },
        {
          label: 'Cloudflare',
          click: () => {
            mainWindow.webContents.send('tray:quick-connect', 'cloudflare');
          },
        },
        {
          label: 'Shecan',
          click: () => {
            mainWindow.webContents.send('tray:quick-connect', 'shecan');
          },
        },
      ],
    },
    {
      label: isConnected ? 'Disconnect' : 'Connect',
      click: () => {
        mainWindow.webContents.send(isConnected ? 'tray:disconnect' : 'tray:connect');
      },
    },
    { type: 'separator' },
    {
      label: 'Flush DNS Cache',
      click: () => {
        mainWindow.webContents.send('tray:flush');
      },
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: 'Quit',
      click: () => {
        (app as any).isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function setTrayConnectionStatus(tray: Tray, mainWindow: BrowserWindow, connected: boolean) {
  isConnected = connected;
  updateTrayMenu(tray, mainWindow);
}
