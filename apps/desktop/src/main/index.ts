import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from 'electron';
import { join } from 'path';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { registerIpcHandlers } from './ipc';
import { createTray } from './tray';

// Types
interface AppConfig {
  language: 'en' | 'fa';
  theme: 'dark' | 'light' | 'system';
  startMinimized: boolean;
  minimizeToTray: boolean;
  autoStart: boolean;
  showNotifications: boolean;
  enableAnalytics: boolean;
  autoSyncServers: boolean;
  lastServerSync?: number;
  selectedInterface?: string;
}

interface StoreData {
  config: AppConfig;
  pinnedServers: string[];
  customServers: any[];
  lastConnectedServer?: string;
  connectionHistory: any[];
}

const STORE_KEYS = {
  CONFIG: 'config',
  PINNED_SERVERS: 'pinnedServers',
  CUSTOM_SERVERS: 'customServers',
  CONNECTION_HISTORY: 'connectionHistory',
};

const DEFAULT_CONFIG: AppConfig = {
  language: 'en',
  theme: 'dark',
  startMinimized: false,
  minimizeToTray: true,
  autoStart: false,
  showNotifications: true,
  enableAnalytics: false,
  autoSyncServers: true,
};

// Store instance
const store = new Store<StoreData>({
  defaults: {
    config: DEFAULT_CONFIG,
    pinnedServers: [],
    customServers: [],
    connectionHistory: [],
  },
});

// Window instance
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0a',
    icon: join(__dirname, '../../public/logo.svg'),
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
    const config = store.get(STORE_KEYS.CONFIG);
    if (!config?.startMinimized) {
      mainWindow?.show();
    }
  });

  // Handle close
  mainWindow.on('close', (e) => {
    const config = store.get(STORE_KEYS.CONFIG);
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
