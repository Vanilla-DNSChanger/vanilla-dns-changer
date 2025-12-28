import { ipcMain, shell, app, BrowserWindow } from 'electron';
import Store from 'electron-store';
import { IPC_CHANNELS, STORE_KEYS } from '@vanilla-dns/shared';
import type { StoreData, DnsServer, CustomDnsServer, AppConfig } from '@vanilla-dns/shared';
import { getPlatform } from './platforms';
import { setTrayConnectionStatus } from './tray';

export function registerIpcHandlers(store: Store<StoreData>, mainWindow: BrowserWindow) {
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
    return store.get(STORE_KEYS.CONFIG);
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET, (_, config: Partial<AppConfig>) => {
    const current = store.get(STORE_KEYS.CONFIG);
    store.set(STORE_KEYS.CONFIG, { ...current, ...config });
    return store.get(STORE_KEYS.CONFIG);
  });

  // Servers
  ipcMain.handle(IPC_CHANNELS.SERVERS_GET, () => {
    return {
      pinned: store.get(STORE_KEYS.PINNED_SERVERS, []),
      custom: store.get(STORE_KEYS.CUSTOM_SERVERS, []),
    };
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_ADD_CUSTOM, (_, server: CustomDnsServer) => {
    const custom = store.get(STORE_KEYS.CUSTOM_SERVERS, []);
    custom.push(server);
    store.set(STORE_KEYS.CUSTOM_SERVERS, custom);
    return custom;
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_REMOVE_CUSTOM, (_, key: string) => {
    const custom = store.get(STORE_KEYS.CUSTOM_SERVERS, []);
    const filtered = custom.filter((s: CustomDnsServer) => s.key !== key);
    store.set(STORE_KEYS.CUSTOM_SERVERS, filtered);
    return filtered;
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_PIN, (_, key: string) => {
    const pinned = store.get(STORE_KEYS.PINNED_SERVERS, []);
    if (!pinned.includes(key)) {
      pinned.push(key);
      store.set(STORE_KEYS.PINNED_SERVERS, pinned);
    }
    return pinned;
  });

  ipcMain.handle(IPC_CHANNELS.SERVERS_UNPIN, (_, key: string) => {
    const pinned = store.get(STORE_KEYS.PINNED_SERVERS, []);
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
