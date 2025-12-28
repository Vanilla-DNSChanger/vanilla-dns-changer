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
 * macOS Platform implementation for CLI
 */
export class MacPlatform extends Platform {
  readonly type = 'darwin' as const;
  private networkService: string = 'Wi-Fi';

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const serverStr = servers.join(' ');
      await this.executeElevated(
        `networksetup -setdnsservers "${this.networkService}" ${serverStr}`
      );
      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      await this.executeElevated(
        `networksetup -setdnsservers "${this.networkService}" "Empty"`
      );
      return { success: true, message: 'DNS reset to default' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      const { stdout } = await this.execute(
        `networksetup -getdnsservers "${this.networkService}"`
      );

      if (stdout.includes("aren't any DNS Servers")) {
        return [];
      }

      return stdout.split('\n').filter((s) => s.match(/^\d+\.\d+\.\d+\.\d+$/));
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

      const lines = stdout
        .split('\n')
        .slice(1)
        .filter((l) => l.trim() && !l.startsWith('*'));

      for (const name of lines) {
        try {
          const { stdout: status } = await this.execute(
            `networksetup -getinfo "${name}"`
          );
          const isActive =
            !status.includes('manually') && status.includes('IP address:');

          interfaces.push({
            name,
            displayName: name,
            type: name.toLowerCase().includes('wi-fi')
              ? 'wifi'
              : name.toLowerCase().includes('ethernet')
              ? 'ethernet'
              : 'other',
            isActive,
          });
        } catch {
          continue;
        }
      }

      return interfaces;
    } catch {
      return [];
    }
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      await this.executeElevated(
        'dscacheutil -flushcache; killall -HUP mDNSResponder'
      );
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
    return execAsync(command, { encoding: 'utf8' });
  }
}
