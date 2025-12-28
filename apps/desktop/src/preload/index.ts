import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@vanilla-dns/shared';

// Expose protected methods in the renderer process
contextBridge.exposeInMainWorld('electron', {
  // DNS Operations
  dns: {
    connect: (servers: string[]) => ipcRenderer.invoke(IPC_CHANNELS.DNS_CONNECT, servers),
    disconnect: () => ipcRenderer.invoke(IPC_CHANNELS.DNS_DISCONNECT),
    getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.DNS_STATUS),
    flush: () => ipcRenderer.invoke(IPC_CHANNELS.DNS_FLUSH),
    ping: (server: string) => ipcRenderer.invoke(IPC_CHANNELS.DNS_PING, server),
  },

  // Network
  network: {
    getInterfaces: () => ipcRenderer.invoke(IPC_CHANNELS.NETWORK_INTERFACES),
  },

  // Servers
  servers: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_GET),
    addCustom: (server: any) => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_ADD_CUSTOM, server),
    removeCustom: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_REMOVE_CUSTOM, key),
    pin: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_PIN, key),
    unpin: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_UNPIN, key),
  },

  // Config
  config: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),
    set: (config: any) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET, config),
  },

  // Window
  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
    toggleDevTools: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_TOGGLE_DEVTOOLS),
  },

  // System
  system: {
    platform: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_PLATFORM),
    isElevated: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_IS_ELEVATED),
    openExternal: (url: string) => ipcRenderer.send(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, url),
  },

  // Events
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'update:available',
      'update:downloaded',
      'tray:quick-connect',
      'tray:connect',
      'tray:disconnect',
      'tray:flush',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => callback(...args));
    }
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
});

// Type declarations for the exposed API
export interface ElectronAPI {
  dns: {
    connect: (servers: string[]) => Promise<{ success: boolean; message?: string; error?: string }>;
    disconnect: () => Promise<{ success: boolean; message?: string; error?: string }>;
    getStatus: () => Promise<{
      isConnected: boolean;
      activeDns: string[];
      serverName?: string;
    }>;
    flush: () => Promise<{ success: boolean; message?: string; error?: string }>;
    ping: (server: string) => Promise<{ server: string; latency: number; success: boolean }>;
  };
  network: {
    getInterfaces: () => Promise<any[]>;
  };
  servers: {
    get: () => Promise<{ pinned: string[]; custom: any[] }>;
    addCustom: (server: any) => Promise<any[]>;
    removeCustom: (key: string) => Promise<any[]>;
    pin: (key: string) => Promise<string[]>;
    unpin: (key: string) => Promise<string[]>;
  };
  config: {
    get: () => Promise<any>;
    set: (config: any) => Promise<any>;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    toggleDevTools: () => void;
  };
  system: {
    platform: () => Promise<string>;
    isElevated: () => Promise<boolean>;
    openExternal: (url: string) => void;
  };
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
