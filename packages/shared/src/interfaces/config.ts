/**
 * Application configuration
 */
export interface AppConfig {
  /** Current language */
  language: 'en' | 'fa';
  /** Theme mode */
  theme: 'dark' | 'light' | 'system';
  /** Start minimized to tray */
  startMinimized: boolean;
  /** Minimize to tray on close */
  minimizeToTray: boolean;
  /** Start on system boot */
  autoStart: boolean;
  /** Show notifications */
  showNotifications: boolean;
  /** Enable analytics */
  enableAnalytics: boolean;
  /** Auto-sync servers from GitHub */
  autoSyncServers: boolean;
  /** Last sync timestamp */
  lastServerSync?: number;
  /** Selected network interface (Windows) */
  selectedInterface?: string;
}

/**
 * Default application configuration
 */
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

/**
 * Store data structure
 */
export interface StoreData {
  config: AppConfig;
  pinnedServers: string[];
  customServers: import('./server').CustomDnsServer[];
  lastConnectedServer?: string;
  connectionHistory: ConnectionHistoryItem[];
}

/**
 * Connection history item
 */
export interface ConnectionHistoryItem {
  serverKey: string;
  serverName: string;
  connectedAt: number;
  disconnectedAt?: number;
}
