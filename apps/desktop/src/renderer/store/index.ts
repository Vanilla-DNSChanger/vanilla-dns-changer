import { create } from 'zustand';
import {
  DnsServer,
  DnsStatus,
  AppConfig,
  CustomDnsServer,
  BUILTIN_DNS_SERVERS,
  DEFAULT_CONFIG,
} from '@vanilla-dns/shared';

interface AppState {
  // DNS Status
  status: DnsStatus;
  isConnecting: boolean;
  selectedServer: DnsServer | null;

  // Servers
  servers: DnsServer[];
  customServers: CustomDnsServer[];
  pinnedServerKeys: string[];

  // Config
  config: AppConfig;

  // Actions
  setStatus: (status: DnsStatus) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setSelectedServer: (server: DnsServer | null) => void;
  setServers: (servers: DnsServer[]) => void;
  setCustomServers: (servers: CustomDnsServer[]) => void;
  setPinnedServerKeys: (keys: string[]) => void;
  setConfig: (config: Partial<AppConfig>) => void;

  // Async Actions
  loadConfig: () => Promise<void>;
  loadServers: () => Promise<void>;
  loadStatus: () => Promise<void>;
  connect: (server: DnsServer) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  flushDns: () => Promise<boolean>;
  pingServer: (server: string) => Promise<number>;
  addCustomServer: (server: CustomDnsServer) => Promise<void>;
  removeCustomServer: (key: string) => Promise<void>;
  pinServer: (key: string) => Promise<void>;
  unpinServer: (key: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  status: {
    isConnected: false,
    activeDns: [],
  },
  isConnecting: false,
  selectedServer: null,
  servers: BUILTIN_DNS_SERVERS,
  customServers: [],
  pinnedServerKeys: [],
  config: DEFAULT_CONFIG,

  // Setters
  setStatus: (status) => set({ status }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setSelectedServer: (server) => set({ selectedServer: server }),
  setServers: (servers) => set({ servers }),
  setCustomServers: (customServers) => set({ customServers }),
  setPinnedServerKeys: (pinnedServerKeys) => set({ pinnedServerKeys }),
  setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),

  // Async Actions
  loadConfig: async () => {
    try {
      const config = await window.electron.config.get();
      if (config) {
        set({ config });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  },

  loadServers: async () => {
    try {
      const { pinned, custom } = await window.electron.servers.get();
      set({
        pinnedServerKeys: pinned || [],
        customServers: custom || [],
      });
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  },

  loadStatus: async () => {
    try {
      const status = await window.electron.dns.getStatus();
      set({ status });

      // Try to find the connected server
      if (status.isConnected && status.activeDns.length > 0) {
        const allServers = [...get().servers, ...get().customServers];
        const connectedServer = allServers.find(
          (s) => s.servers[0] === status.activeDns[0]
        );
        if (connectedServer) {
          set({ selectedServer: connectedServer });
        }
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  },

  connect: async (server) => {
    set({ isConnecting: true });
    try {
      const servers = server.servers.filter(Boolean) as string[];
      const result = await window.electron.dns.connect(servers);

      if (result.success) {
        set({
          status: {
            isConnected: true,
            activeDns: servers,
            serverName: server.name,
            serverKey: server.key,
          },
          selectedServer: server,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect:', error);
      return false;
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnect: async () => {
    set({ isConnecting: true });
    try {
      const result = await window.electron.dns.disconnect();

      if (result.success) {
        set({
          status: {
            isConnected: false,
            activeDns: [],
          },
          selectedServer: null,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to disconnect:', error);
      return false;
    } finally {
      set({ isConnecting: false });
    }
  },

  flushDns: async () => {
    try {
      const result = await window.electron.dns.flush();
      return result.success;
    } catch (error) {
      console.error('Failed to flush DNS:', error);
      return false;
    }
  },

  pingServer: async (server) => {
    try {
      const result = await window.electron.dns.ping(server);
      return result.success ? result.latency : -1;
    } catch {
      return -1;
    }
  },

  addCustomServer: async (server) => {
    try {
      const custom = await window.electron.servers.addCustom(server);
      set({ customServers: custom });
    } catch (error) {
      console.error('Failed to add custom server:', error);
    }
  },

  removeCustomServer: async (key) => {
    try {
      const custom = await window.electron.servers.removeCustom(key);
      set({ customServers: custom });
    } catch (error) {
      console.error('Failed to remove custom server:', error);
    }
  },

  pinServer: async (key) => {
    try {
      const pinned = await window.electron.servers.pin(key);
      set({ pinnedServerKeys: pinned });
    } catch (error) {
      console.error('Failed to pin server:', error);
    }
  },

  unpinServer: async (key) => {
    try {
      const pinned = await window.electron.servers.unpin(key);
      set({ pinnedServerKeys: pinned });
    } catch (error) {
      console.error('Failed to unpin server:', error);
    }
  },
}));
