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
 */
const DEFAULT_NETWORK_SERVICES = [
  'Wi-Fi',
  'Ethernet',
  'USB 10/100/1000 LAN',
  'Thunderbolt Ethernet',
  'Thunderbolt Bridge',
  'USB Ethernet',
];

/**
 * macOS Platform implementation for CLI
 * Handles both Wi-Fi and Ethernet connections
 */
export class MacPlatform extends Platform {
  readonly type = 'darwin' as const;
  private selectedService: string | null = null;

  /**
   * Get all active network services
   */
  private async getActiveNetworkServices(): Promise<string[]> {
    const activeServices: string[] = [];

    try {
      const { stdout } = await this.execute('networksetup -listallnetworkservices');
      const allServices = stdout
        .split('\n')
        .slice(1)
        .filter((s) => s.trim() && !s.startsWith('*'));

      for (const service of allServices) {
        try {
          const { stdout: info } = await this.execute(
            `networksetup -getinfo "${service}"`
          );

          if (info.includes('IP address:') && !info.includes('IP address: none')) {
            activeServices.push(service);
          }
        } catch {
          continue;
        }
      }
    } catch {}

    return activeServices;
  }

  /**
   * Get the primary network service
   */
  private async getPrimaryService(): Promise<string | null> {
    if (this.selectedService) {
      return this.selectedService;
    }

    const activeServices = await this.getActiveNetworkServices();

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
        await this.flushDnsCache();
        return {
          success: true,
          message: `DNS updated on ${successCount} network service(s)`,
        };
      }

      return {
        success: false,
        error: `Failed to set DNS: ${errors.join(', ')}`,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      const activeServices = await this.getActiveNetworkServices();

      if (activeServices.length === 0) {
        for (const service of DEFAULT_NETWORK_SERVICES) {
          try {
            await this.executeElevated(
              `networksetup -setdnsservers "${service}" "Empty"`
            );
          } catch {}
        }
        return { success: true, message: 'DNS reset to default' };
      }

      let successCount = 0;

      for (const service of activeServices) {
        try {
          await this.executeElevated(
            `networksetup -setdnsservers "${service}" "Empty"`
          );
          successCount++;
        } catch {}
      }

      if (successCount > 0) {
        await this.flushDnsCache();
        return {
          success: true,
          message: `DNS reset on ${successCount} network service(s)`,
        };
      }

      return { success: false, error: 'Failed to clear DNS' };
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

      if (stdout.includes("aren't any DNS Servers")) {
        return [];
      }

      return stdout
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.match(/^\d+\.\d+\.\d+\.\d+$/));
    } catch {
      return [];
    }
  }

  async getStatus(): Promise<DnsStatus> {
    const activeDns = await this.getActiveDns();
    return {
      isConnected: activeDns.length > 0,
      activeDns,
    };
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const { stdout } = await this.execute(
        'networksetup -listallnetworkservices'
      );
      const interfaces: NetworkInterface[] = [];

      const services = stdout
        .split('\n')
        .slice(1)
        .filter((l) => l.trim() && !l.startsWith('*'));

      for (const name of services) {
        try {
          const { stdout: info } = await this.execute(
            `networksetup -getinfo "${name}"`
          );

          const hasIp =
            info.includes('IP address:') && !info.includes('IP address: none');

          let ip: string | undefined;
          const ipMatch = info.match(/IP address:\s*(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            ip = ipMatch[1];
          }

          interfaces.push({
            name,
            displayName: name,
            type: name.toLowerCase().includes('wi-fi')
              ? 'wifi'
              : name.toLowerCase().includes('ethernet')
              ? 'ethernet'
              : 'other',
            isActive: hasIp,
            ip,
          });
        } catch {
          continue;
        }
      }

      interfaces.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));
      return interfaces;
    } catch {
      return [];
    }
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      const commands = [
        'dscacheutil -flushcache',
        'killall -HUP mDNSResponder',
      ];

      for (const cmd of commands) {
        try {
          await this.executeElevated(cmd);
        } catch {}
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

  setNetworkService(service: string): void {
    this.selectedService = service;
  }

  protected async executeElevated(
    command: string
  ): Promise<{ stdout: string; stderr: string }> {
    const sudo = require('sudo-prompt');
    return new Promise((resolve, reject) => {
      sudo.exec(
        command,
        { name: 'Vanilla DNS Changer' },
        (error: any, stdout: string, stderr: string) => {
          if (error) reject(error);
          else resolve({ stdout: stdout || '', stderr: stderr || '' });
        }
      );
    });
  }

  protected async execute(
    command: string
  ): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, { encoding: 'utf8', timeout: 15000 });
  }
}
