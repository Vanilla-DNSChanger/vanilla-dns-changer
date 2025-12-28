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
 * Windows Platform implementation
 */
export class WindowsPlatform extends Platform {
  readonly type = 'windows' as const;
  private selectedInterface: string = 'Wi-Fi';

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const [primary, secondary] = servers;
      
      // Set primary DNS
      await this.executeElevated(
        `netsh interface ip set dns name="${this.selectedInterface}" static ${primary}`
      );
      
      // Set secondary DNS if provided
      if (secondary) {
        await this.executeElevated(
          `netsh interface ip add dns name="${this.selectedInterface}" ${secondary} index=2`
        );
      }

      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      await this.executeElevated(
        `netsh interface ip set dns name="${this.selectedInterface}" dhcp`
      );
      return { success: true, message: 'DNS reset to DHCP' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      const { stdout } = await this.execute(
        `netsh interface ip show dns "${this.selectedInterface}"`
      );
      
      const dnsServers: string[] = [];
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (match) {
          dnsServers.push(match[1]);
        }
      }
      
      return dnsServers;
    } catch {
      return [];
    }
  }

  async getStatus(): Promise<DnsStatus> {
    const activeDns = await this.getActiveDns();
    const interfaces = await this.getNetworkInterfaces();
    const activeInterface = interfaces.find(i => i.isActive);

    return {
      isConnected: activeDns.length > 0 && !activeDns.includes('0.0.0.0'),
      activeDns,
      activeInterface,
    };
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const { stdout } = await this.execute('netsh interface show interface');
      const interfaces: NetworkInterface[] = [];
      const lines = stdout.split('\n').slice(3); // Skip header

      for (const line of lines) {
        const parts = line.trim().split(/\s{2,}/);
        if (parts.length >= 4) {
          const [adminState, state, type, name] = parts;
          if (name && adminState === 'Enabled') {
            interfaces.push({
              name,
              displayName: name,
              type: name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')
                ? 'wifi'
                : name.toLowerCase().includes('ethernet')
                ? 'ethernet'
                : 'other',
              isActive: state === 'Connected',
            });
          }
        }
      }

      return interfaces;
    } catch {
      return [];
    }
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      await this.executeElevated('ipconfig /flushdns');
      return { success: true, message: 'DNS cache flushed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async pingServer(server: string): Promise<PingResult> {
    try {
      const start = Date.now();
      await this.execute(`ping -n 1 -w 3000 ${server}`);
      const latency = Date.now() - start;
      return { server, latency, success: true };
    } catch (error: any) {
      return { server, latency: -1, success: false, error: error.message };
    }
  }

  async isElevated(): Promise<boolean> {
    try {
      await this.execute('net session');
      return true;
    } catch {
      return false;
    }
  }

  setInterface(interfaceName: string) {
    this.selectedInterface = interfaceName;
  }

  protected async executeElevated(command: string): Promise<{ stdout: string; stderr: string }> {
    // Using sudo-prompt for elevated execution
    const sudo = require('sudo-prompt');
    return new Promise((resolve, reject) => {
      sudo.exec(command, { name: 'Vanilla DNS Changer' }, (error: any, stdout: string, stderr: string) => {
        if (error) reject(error);
        else resolve({ stdout: stdout || '', stderr: stderr || '' });
      });
    });
  }

  protected async execute(command: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, { encoding: 'utf8' });
  }
}
