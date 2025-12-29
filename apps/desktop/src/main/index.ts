import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from 'electron';
import { join } from 'path';
import { autoUpdater } from 'electron-updater';
import { registerIpcHandlers } from './ipc';
import { createTray } from './tray';
import { createStore, AppStore, AppConfig, STORE_KEYS, DEFAULT_CONFIG } from './store';

// Store instance (initialized later when app is ready)
let store: AppStore;

// Window instance
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Create the main window
function getIconPath(): string {
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    return join(__dirname, '../../public/icon.png');
  }
  return join(__dirname, '../renderer/icon.png');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0a',
    icon: getIconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    const config = store.get(STORE_KEYS.CONFIG) as AppConfig | undefined;
    if (!config?.startMinimized) {
      mainWindow?.show();
    }
  });

  // Handle close
  mainWindow.on('close', (e) => {
    const config = store.get(STORE_KEYS.CONFIG) as AppConfig | undefined;
    if (config?.minimizeToTray && !(app as any).isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// App ready
app.whenReady().then(async () => {
  // Initialize store (must be after app is ready to access userData path)
  store = createStore();

  // Create window
  createWindow();

  // Create tray
  tray = createTray(mainWindow!, store);

  // Register IPC handlers
  registerIpcHandlers(store, mainWindow!);

  // Check for updates
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }

  // macOS: recreate window on dock click
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

// Handle app quit
app.on('before-quit', () => {
  (app as any).isQuitting = true;
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update:available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update:downloaded');
});

// Export for other modules
export { mainWindow, store, tray };
