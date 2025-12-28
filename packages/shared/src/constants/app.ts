/**
 * Application URLs and endpoints
 */
export const URLS = {
  /** GitHub organization */
  GITHUB_ORG: 'https://github.com/Vanilla-DNSChanger',
  
  /** Main repository */
  GITHUB_REPO: 'https://github.com/Vanilla-DNSChanger/vanilla-dns-changer',
  
  /** Website */
  WEBSITE: 'https://vanilla-dnschanger.github.io',
  
  /** Server sync URL (raw JSON from GitHub) */
  SERVERS_SYNC_URL: 'https://raw.githubusercontent.com/Vanilla-DNSChanger/vanilla-dns-changer/main/servers.json',
  
  /** Releases URL */
  RELEASES_URL: 'https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases',
  
  /** Issues URL */
  ISSUES_URL: 'https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/issues',
  
  /** Author Twitter/X */
  AUTHOR_TWITTER: 'https://x.com/sudolite',
  
  /** Contributors API */
  CONTRIBUTORS_API: 'https://api.github.com/repos/Vanilla-DNSChanger/vanilla-dns-changer/contributors',
};

/**
 * Application metadata
 */
export const APP_INFO = {
  name: 'Vanilla DNS Changer',
  shortName: 'Vanilla DNS',
  version: '1.0.0',
  description: 'Open-source DNS Changer for Windows, macOS, and Linux',
  author: {
    name: 'SudoLite',
    twitter: 'https://x.com/sudolite',
  },
  license: 'MIT',
};

/**
 * IPC Channel names for Electron
 */
export const IPC_CHANNELS = {
  // DNS Operations
  DNS_CONNECT: 'dns:connect',
  DNS_DISCONNECT: 'dns:disconnect',
  DNS_STATUS: 'dns:status',
  DNS_FLUSH: 'dns:flush',
  DNS_PING: 'dns:ping',
  
  // Server Management
  SERVERS_GET: 'servers:get',
  SERVERS_SYNC: 'servers:sync',
  SERVERS_ADD_CUSTOM: 'servers:add-custom',
  SERVERS_REMOVE_CUSTOM: 'servers:remove-custom',
  SERVERS_PIN: 'servers:pin',
  SERVERS_UNPIN: 'servers:unpin',
  
  // Config
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_RESET: 'config:reset',
  
  // Network
  NETWORK_INTERFACES: 'network:interfaces',
  NETWORK_SELECT_INTERFACE: 'network:select-interface',
  
  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_DEVTOOLS: 'window:toggle-devtools',
  
  // System
  SYSTEM_PLATFORM: 'system:platform',
  SYSTEM_IS_ELEVATED: 'system:is-elevated',
  SYSTEM_OPEN_EXTERNAL: 'system:open-external',
  
  // Tray
  TRAY_UPDATE: 'tray:update',
  
  // Updates
  UPDATE_CHECK: 'update:check',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_INSTALL: 'update:install',
};

/**
 * Store keys for electron-store
 */
export const STORE_KEYS = {
  CONFIG: 'config',
  PINNED_SERVERS: 'pinnedServers',
  CUSTOM_SERVERS: 'customServers',
  LAST_CONNECTED: 'lastConnectedServer',
  CONNECTION_HISTORY: 'connectionHistory',
  CACHED_SERVERS: 'cachedServers',
  LAST_SYNC: 'lastServerSync',
};

/**
 * Theme colors (Kick style)
 */
export const THEME_COLORS = {
  // Primary green
  green: {
    DEFAULT: '#53FC18',
    hover: '#45d615',
    dark: '#3cc212',
    light: '#6ffd42',
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#53FC18',
    500: '#45d615',
    600: '#3cc212',
    700: '#2e9e0e',
    800: '#257a0b',
    900: '#1c5708',
  },
  
  // Dark theme
  dark: {
    bg: '#0a0a0a',
    card: '#141414',
    elevated: '#1a1a1a',
    border: '#2a2a2a',
    hover: '#333333',
  },
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    muted: '#666666',
    disabled: '#444444',
  },
  
  // Status colors
  status: {
    success: '#53FC18',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

/**
 * Animation durations (ms)
 */
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
