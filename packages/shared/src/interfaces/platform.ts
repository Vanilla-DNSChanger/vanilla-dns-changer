/**
 * Supported operating system platforms
 */
export type PlatformType = 'windows' | 'linux' | 'darwin';

/**
 * Network interface information
 */
export interface NetworkInterface {
  /** Interface name/identifier */
  name: string;
  /** Display name */
  displayName: string;
  /** Interface type (ethernet, wifi, etc.) */
  type: 'ethernet' | 'wifi' | 'other';
  /** Whether this interface is active */
  isActive: boolean;
  /** Current DNS servers configured */
  currentDns?: string[];
  /** MAC address */
  mac?: string;
  /** IP address */
  ip?: string;
}

/**
 * DNS connection status
 */
export interface DnsStatus {
  /** Whether connected to a custom DNS */
  isConnected: boolean;
  /** Currently active DNS servers */
  activeDns: string[];
  /** Name of the connected server (if known) */
  serverName?: string;
  /** Server key (if known) */
  serverKey?: string;
  /** Active network interface */
  activeInterface?: NetworkInterface;
}

/**
 * Result of a DNS operation
 */
export interface DnsOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Ping result
 */
export interface PingResult {
  server: string;
  latency: number;
  success: boolean;
  error?: string;
}

/**
 * Abstract platform interface
 * Each OS implements this interface
 */
export interface IPlatform {
  /** Platform type */
  readonly type: PlatformType;
  
  /** Set DNS servers for the system */
  setDns(servers: string[]): Promise<DnsOperationResult>;
  
  /** Clear/reset DNS to default (DHCP) */
  clearDns(): Promise<DnsOperationResult>;
  
  /** Get currently active DNS servers */
  getActiveDns(): Promise<string[]>;
  
  /** Get current DNS status */
  getStatus(): Promise<DnsStatus>;
  
  /** Get list of network interfaces */
  getNetworkInterfaces(): Promise<NetworkInterface[]>;
  
  /** Flush DNS cache */
  flushDnsCache(): Promise<DnsOperationResult>;
  
  /** Ping a DNS server */
  pingServer(server: string): Promise<PingResult>;
  
  /** Check if running with admin/root privileges */
  isElevated(): Promise<boolean>;
}
