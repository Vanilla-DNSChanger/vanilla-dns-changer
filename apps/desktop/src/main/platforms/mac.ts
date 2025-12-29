import { exec } from 'child_process';
import { promisify } from 'util';
import {
  Platform,
  DnsStatus,
  DnsOperationResult,
  NetworkInterface,
  PingResult,
} from '@vanilla-dns/shared';

const execAsync = promisify(exec);

/**
 * Default network services to check on macOS
 * Includes common variations for different Mac models
 */
const DEFAULT_NETWORK_SERVICES = [
  'Wi-Fi',
  'Ethernet',
  'USB 10/100/1000 LAN',
  'Thunderbolt Ethernet',
  'Thunderbolt Bridge',
  'USB Ethernet',
  'Display Ethernet',
];

/**
 * macOS Platform implementation
 * Handles both Wi-Fi and Ethernet connections
 */
export class MacPlatform extends Platform {
  readonly type = 'darwin' as const;
  private selectedService: string | null = null;
  private cachedActiveServices: string[] = [];
  private lastServiceCheck: number = 0;
  private static SERVICE_CACHE_TTL = 10000; // 10 seconds

  /**
   * Get all active network services
   */
  private async getActiveNetworkServices(): Promise<string[]> {
    const now = Date.now();
    if (this.cachedActiveServices.length > 0 && (now - this.lastServiceCheck) < MacPlatform.SERVICE_CACHE_TTL) {
      return this.cachedActiveServices;
    }

    const activeServices: string[] = [];

    try {
      // Get list of all network services
      const { stdout } = await this.execute('networksetup -listallnetworkservices');
      const allServices = stdout.split('\n')
        .slice(1) // Skip the header line
        .filter(s => s.trim() && !s.startsWith('*')); // Skip disabled services (marked with *)

      // Check each service for active status
      for (const service of allServices) {
        try {
          const { stdout: info } = await this.execute(`networksetup -getinfo "${service}"`);
          
          // Check if the service has an IP address (meaning it's connected)
          if (info.includes('IP address:') && !info.includes('IP address: none')) {
            activeServices.push(service);
          }
        } catch {
          continue;
        }
      }

      this.cachedActiveServices = activeServices;
      this.lastServiceCheck = now;
    } catch (error) {
      console.error('getActiveNetworkServices error:', error);
    }

    return activeServices;
  }

  /**
   * Get the primary network service to use
   */
  private async getPrimaryService(): Promise<string | null> {
    if (this.selectedService) {
      return this.selectedService;
    }

    const activeServices = await this.getActiveNetworkServices();
    
    // Prefer Wi-Fi if active, otherwise use the first active service
    if (activeServices.includes('Wi-Fi')) {
      return 'Wi-Fi';
    }
    if (activeServices.includes('Ethernet')) {
      return 'Ethernet';
    }

    return activeServices[0] || null;
  }

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const serverStr = servers.join(' ');
      const activeServices = await this.getActiveNetworkServices();

      if (activeServices.length === 0) {
        return { success: false, error: 'No active network connection found' };
      }

      const errors: string[] = [];
      let successCount = 0;

      // Set DNS on all active network services
      for (const service of activeServices) {
        try {
          await this.executeElevated(
            `networksetup -setdnsservers "${service}" ${serverStr}`
          );
          successCount++;
        } catch (error: any) {
          errors.push(`${service}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        // Flush DNS cache
        await this.flushDnsCache();
        return { 
          success: true, 
          message: `DNS updated on ${successCount} network service(s)` 
        };
      }

      return { 
        success: false, 
        error: `Failed to set DNS: ${errors.join(', ')}` 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      const activeServices = await this.getActiveNetworkServices();

      if (activeServices.length === 0) {
        // Try with default services
        for (const service of DEFAULT_NETWORK_SERVICES) {
          try {
            await this.executeElevated(
              `networksetup -setdnsservers "${service}" "Empty"`
            );
          } catch {}
        }
        return { success: true, message: 'DNS reset to default' };
      }

      const errors: string[] = [];
      let successCount = 0;

      // Clear DNS on all active network services
      for (const service of activeServices) {
        try {
          await this.executeElevated(
            `networksetup -setdnsservers "${service}" "Empty"`
          );
          successCount++;
        } catch (error: any) {
          errors.push(`${service}: ${error.message}`);
        }
      }

      // Clear cache
      this.cachedActiveServices = [];

      if (successCount > 0) {
        await this.flushDnsCache();
        return { 
          success: true, 
          message: `DNS reset on ${successCount} network service(s)` 
        };
      }

      return { 
        success: false, 
        error: `Failed to clear DNS: ${errors.join(', ')}` 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      const primaryService = await this.getPrimaryService();
      
      if (!primaryService) {
        return [];
      }

      const { stdout } = await this.execute(
        `networksetup -getdnsservers "${primaryService}"`
      );

      // "There aren't any DNS Servers set" means DHCP
      if (stdout.includes("aren't any DNS Servers")) {
        return [];
      }

      // Parse DNS servers
      return stdout.split('\n')
        .map(s => s.trim())
        .filter(s => s.match(/^\d+\.\d+\.\d+\.\d+$/));
    } catch {
      return [];
    }
  }

  async getStatus(): Promise<DnsStatus> {
    const activeDns = await this.getActiveDns();
    const interfaces = await this.getNetworkInterfaces();
    const activeInterface = interfaces.find(i => i.isActive);

    // Check if DNS is manually set (not empty/DHCP)
    const isConnected = activeDns.length > 0;

    return {
      isConnected,
      activeDns,
      activeInterface,
    };
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const { stdout } = await this.execute('networksetup -listallnetworkservices');
      const interfaces: NetworkInterface[] = [];

      const services = stdout.split('\n')
        .slice(1) // Skip header
        .filter(l => l.trim() && !l.startsWith('*'));

      for (const name of services) {
        try {
          const { stdout: info } = await this.execute(`networksetup -getinfo "${name}"`);
          
          // Check for IP address to determine if active
          const hasIp = info.includes('IP address:') && !info.includes('IP address: none');
          
          // Extract IP if present
          let ip: string | undefined;
          const ipMatch = info.match(/IP address:\s*(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            ip = ipMatch[1];
          }

          interfaces.push({
            name,
            displayName: name,
            type: this.getInterfaceType(name),
            isActive: hasIp,
            ip,
          });
        } catch {
          continue;
        }
      }

      // Sort so active interfaces come first
      interfaces.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));

      return interfaces;
    } catch {
      return [];
    }
  }

  private getInterfaceType(name: string): 'wifi' | 'ethernet' | 'other' {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('wi-fi') || nameLower.includes('wifi') || nameLower.includes('airport')) {
      return 'wifi';
    }
    if (nameLower.includes('ethernet') || nameLower.includes('thunderbolt') || nameLower.includes('usb')) {
      return 'ethernet';
    }
    return 'other';
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      // macOS uses mDNSResponder for DNS caching
      // Different macOS versions may need different commands
      const commands = [
        'dscacheutil -flushcache',
        'killall -HUP mDNSResponder',
        'killall mDNSResponderHelper',
      ];

      for (const cmd of commands) {
        try {
          await this.executeElevated(cmd);
        } catch {
          // Continue even if some commands fail
        }
      }

      return { success: true, message: 'DNS cache flushed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async pingServer(server: string): Promise<PingResult> {
    try {
      const start = Date.now();
      await this.execute(`ping -c 1 -t 3 ${server}`);
      const latency = Date.now() - start;
      return { server, latency, success: true };
    } catch (error: any) {
      return { server, latency: -1, success: false, error: error.message };
    }
  }

  async isElevated(): Promise<boolean> {
    try {
      const { stdout } = await this.execute('id -u');
      return stdout.trim() === '0';
    } catch {
      return false;
    }
  }

  /**
   * Set the network service to use for DNS operations
   */
  setNetworkService(service: string) {
    this.selectedService = service;
    // Clear cache when service changes
    this.cachedActiveServices = [];
  }

  /**
   * Get list of common network services
   */
  getDefaultNetworkServices(): string[] {
    return [...DEFAULT_NETWORK_SERVICES];
  }

  protected async executeElevated(command: string): Promise<{ stdout: string; stderr: string }> {
    const sudo = require('sudo-prompt');
    return new Promise((resolve, reject) => {
      sudo.exec(command, { name: 'Vanilla DNS Changer' }, (error: any, stdout: string, stderr: string) => {
        if (error) reject(error);
        else resolve({ stdout: stdout || '', stderr: stderr || '' });
      });
    });
  }

  protected async execute(command: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, { encoding: 'utf8', timeout: 15000 });
  }
}
