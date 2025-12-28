import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Simple JSON store that doesn't depend on ajv
class SimpleStore<T extends Record<string, any>> {
  private data: T;
  private filePath: string;

  constructor(options: { defaults: T; name?: string }) {
    const userDataPath = app.getPath('userData');
    const configDir = userDataPath;
    
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    this.filePath = join(configDir, `${options.name || 'config'}.json`);
    this.data = this.load(options.defaults);
  }

  private load(defaults: T): T {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8');
        return { ...defaults, ...JSON.parse(raw) };
      }
    } catch (error) {
      console.error('Failed to load store:', error);
    }
    return { ...defaults };
  }

  private save(): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save store:', error);
    }
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.data[key] = value;
    this.save();
  }

  delete<K extends keyof T>(key: K): void {
    delete this.data[key];
    this.save();
  }

  clear(): void {
    this.data = {} as T;
    this.save();
  }

  has<K extends keyof T>(key: K): boolean {
    return key in this.data;
  }

  getAll(): T {
    return { ...this.data };
  }

  setAll(data: Partial<T>): void {
    this.data = { ...this.data, ...data };
    this.save();
  }
}

// Types
export interface AppConfig {
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

export interface StoreSchema {
  config: AppConfig;
  pinnedServers: string[];
  customServers: any[];
  lastConnectedServer?: string;
  connectionHistory: any[];
}

export const STORE_KEYS = {
  CONFIG: 'config' as const,
  PINNED_SERVERS: 'pinnedServers' as const,
  CUSTOM_SERVERS: 'customServers' as const,
  CONNECTION_HISTORY: 'connectionHistory' as const,
  LAST_CONNECTED_SERVER: 'lastConnectedServer' as const,
};

export const DEFAULT_CONFIG: AppConfig = {
  language: 'en',
  theme: 'dark',
  startMinimized: false,
  minimizeToTray: true,
  autoStart: false,
  showNotifications: true,
  enableAnalytics: false,
  autoSyncServers: true,
};

export function createStore(): SimpleStore<StoreSchema> {
  return new SimpleStore<StoreSchema>({
    name: 'vanilla-dns-config',
    defaults: {
      config: DEFAULT_CONFIG,
      pinnedServers: [],
      customServers: [],
      connectionHistory: [],
    },
  });
}

export type AppStore = SimpleStore<StoreSchema>;
