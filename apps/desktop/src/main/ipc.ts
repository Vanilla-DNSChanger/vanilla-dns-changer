import { ipcMain, shell, app, BrowserWindow } from 'electron';
import { getPlatform } from './platforms';
import { setTrayConnectionStatus } from './tray';
import { AppStore, AppConfig, STORE_KEYS } from './store';

// Types
interface CustomDnsServer {
  key: string;
  name: string;
  servers: [string, string | null];
  category: string;
  description?: string;
  addedAt: number;
}

const IPC_CHANNELS = {
  DNS_CONNECT: 'dns:connect',
  DNS_DISCONNECT: 'dns:disconnect',
  DNS_STATUS: 'dns:status',
  DNS_FLUSH: 'dns:flush',
  DNS_PING: 'dns:ping',
  NETWORK_INTERFACES: 'network:interfaces',
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  SERVERS_GET: 'servers:get',
  SERVERS_ADD_CUSTOM: 'servers:add-custom',
  SERVERS_REMOVE_CUSTOM: 'servers:remove-custom',
  SERVERS_PIN: 'servers:pin',
  SERVERS_UNPIN: 'servers:unpin',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_DEVTOOLS: 'window:toggle-devtools',
  APP_VERSION: 'app:version',
  APP_OPEN_EXTERNAL: 'app:open-external',
  APP_QUIT: 'app:quit',
  SYSTEM_PLATFORM: 'system:platform',
  SYSTEM_IS_ELEVATED: 'system:is-elevated',
  SYSTEM_OPEN_EXTERNAL: 'system:open-external',
};

export function registerIpcHandlers(store: AppStore, mainWindow: BrowserWindow) {
  const platform = getPlatform();

  // DNS Operations
  ipcMain.handle(IPC_CHANNELS.DNS_CONNECT, async (_, servers: string[]) => {
    try {
      const result = await platform.setDns(servers);
      if (result.success) {
        // Update tray if available
        const { tray } = require('./index');
        if (tray) {
          setTrayConnectionStatus(tray, mainWindow, true);
        }
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.DNS_DISCONNECT, async () => {
    try {
      const result = await platform.clearDns();
      if (result.success) {
        const { tray } = require('./index');
        if (tray) {
          setTrayConnectionStatus(tray, mainWindow, false);
        }
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.DNS_STATUS, async () => {
    try {
      return await platform.getStatus();
    } catch (error: any) {
      return { isConnected: false, activeDns: [], error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.DNS_FLUSH, async () => {
    try {
      return await platform.flushDnsCache();
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.DNS_PING, async (_, server: string) => {
    try {
      return await platform.pingServer(server);
    } catch (error: any) {
      return { server, latency: -1, success: false, error: error.message };
    }
  });

  // Network Interfaces
  ipcMain.handle(IPC_CHANNELS.NETWORK_INTERFACES, async () => {
    try {
      return await platform.getNetworkInterfaces();
    } catch (error: any) {
      return [];
    }
  });

  // Config
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, () => {
    return store.get(STORE_KEYS.CONFIG) as AppConfig;
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET, (_, config: Partial<AppConfig>) => {
    const current = store.get(STORE_KEYS.CONFIG) as AppConfig || {};
    store.set(STORE_KEYS.CONFIG, { ...current, ...config });
    return store.get(STORE_KEYS.CONFIG) as AppConfig;
  });

  // Servers
  ipcMain.handle(IPC_CHANNELS.SERVERS_GET, () => {
    return {
      pinned: store.get(STORE_KEYS.PINNED_SERVERS) as string[] || [],
      custom: store.get(STORE_KEYS.CUSTOM_SERVERS) as CustomDnsServer[] || [],
    };
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_ADD_CUSTOM, (_, server: CustomDnsServer) => {
    const custom = (store.get(STORE_KEYS.CUSTOM_SERVERS) as CustomDnsServer[] || []);
    custom.push(server);
    store.set(STORE_KEYS.CUSTOM_SERVERS, custom);
    return custom;
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_REMOVE_CUSTOM, (_, key: string) => {
    const custom = (store.get(STORE_KEYS.CUSTOM_SERVERS) as CustomDnsServer[] || []);
    const filtered = custom.filter((s: CustomDnsServer) => s.key !== key);
    store.set(STORE_KEYS.CUSTOM_SERVERS, filtered);
    return filtered;
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_PIN, (_, key: string) => {
    const pinned = (store.get(STORE_KEYS.PINNED_SERVERS) as string[] || []);
    if (!pinned.includes(key)) {
      pinned.push(key);
      store.set(STORE_KEYS.PINNED_SERVERS, pinned);
    }
    return pinned;
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_UNPIN, (_, key: string) => {
    const pinned = (store.get(STORE_KEYS.PINNED_SERVERS) as string[] || []);
    const filtered = pinned.filter((k: string) => k !== key);
    store.set(STORE_KEYS.PINNED_SERVERS, filtered);
    return filtered;
  });

  // Window controls
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow.minimize();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow.close();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_TOGGLE_DEVTOOLS, () => {
    mainWindow.webContents.toggleDevTools();
  });

  // System
  ipcMain.handle(IPC_CHANNELS.SYSTEM_PLATFORM, () => {
    return process.platform;
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM_IS_ELEVATED, async () => {
    return await platform.isElevated();
  });

  ipcMain.on(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, (_, url: string) => {
    shell.openExternal(url);
  });
}
