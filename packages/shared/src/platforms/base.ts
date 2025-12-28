import type {
  IPlatform,
  PlatformType,
  DnsStatus,
  DnsOperationResult,
  NetworkInterface,
  PingResult,
} from '../interfaces';

/**
 * Abstract Platform class
 * Base implementation for all platform-specific DNS operations
 */
export abstract class Platform implements IPlatform {
  abstract readonly type: PlatformType;

  /**
   * Set DNS servers for the system
   * @param servers - Array of DNS server addresses [primary, secondary?]
   */
  abstract setDns(servers: string[]): Promise<DnsOperationResult>;

  /**
   * Clear/reset DNS to default (DHCP)
   */
  abstract clearDns(): Promise<DnsOperationResult>;

  /**
   * Get currently active DNS servers
   */
  abstract getActiveDns(): Promise<string[]>;

  /**
   * Get current DNS connection status
   */
  abstract getStatus(): Promise<DnsStatus>;

  /**
   * Get list of available network interfaces
   */
  abstract getNetworkInterfaces(): Promise<NetworkInterface[]>;

  /**
   * Flush the DNS cache
   */
  abstract flushDnsCache(): Promise<DnsOperationResult>;

  /**
   * Ping a DNS server to measure latency
   * @param server - DNS server address to ping
   */
  abstract pingServer(server: string): Promise<PingResult>;

  /**
   * Check if the application is running with elevated privileges
   */
  abstract isElevated(): Promise<boolean>;

  /**
   * Execute a command with elevated privileges
   * @param command - Command to execute
   */
  protected abstract executeElevated(command: string): Promise<{ stdout: string; stderr: string }>;

  /**
   * Execute a command normally
   * @param command - Command to execute
   */
  protected abstract execute(command: string): Promise<{ stdout: string; stderr: string }>;
}

/**
 * Get the current platform type
 */
export function getCurrentPlatformType(): PlatformType {
  switch (process.platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'darwin';
    case 'linux':
      return 'linux';
    default:
      return 'linux';
  }
}

/**
 * Check if the current platform is supported
 */
export function isSupportedPlatform(): boolean {
  return ['win32', 'darwin', 'linux'].includes(process.platform);
}
