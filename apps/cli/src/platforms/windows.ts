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
 * Network interface info from wmic/netsh
 */
interface WinNetworkInterface {
  name: string;
  status: string;
  type: string;
}

/**
 * Windows Platform implementation for CLI
 * Uses netsh for DNS operations
 */
export class WindowsPlatform extends Platform {
  readonly type = 'windows' as const;
  private selectedInterface: string | null = null;

  /**
   * Get the active network interface with internet connection
   */
  private async getActiveInterface(): Promise<string> {
    if (this.selectedInterface) {
      return this.selectedInterface;
    }

    try {
      // Try to get active interface using route command
      const { stdout } = await this.execute(
        'powershell -NoProfile -Command "Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select-Object -ExpandProperty InterfaceAlias | Select-Object -First 1"'
      );
      
      const interfaceName = stdout.trim();
      if (interfaceName) {
        this.selectedInterface = interfaceName;
        return interfaceName;
      }
    } catch {}

    // Fallback: try common interface names
    const commonNames = ['Wi-Fi', 'Ethernet', 'Local Area Connection'];
    for (const name of commonNames) {
      try {
        const { stdout } = await this.execute(`netsh interface show interface name="${name}"`);
        if (stdout.includes('Connected')) {
          this.selectedInterface = name;
          return name;
        }
      } catch {}
    }

    throw new Error('No active network interface found');
  }

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const interfaceName = await this.getActiveInterface();
      const [primary, secondary] = servers;

      // Set primary DNS
      await this.executeElevated(
        `netsh interface ip set dns name="${interfaceName}" static ${primary}`
      );

      // Set secondary DNS if provided
      if (secondary) {
        await this.executeElevated(
          `netsh interface ip add dns name="${interfaceName}" ${secondary} index=2`
        );
      }

      // Flush DNS cache
      await this.flushDnsCache();

      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      const interfaceName = await this.getActiveInterface();

      await this.executeElevated(
        `netsh interface ip set dns name="${interfaceName}" dhcp`
      );

      await this.flushDnsCache();

      return { success: true, message: 'DNS reset to DHCP' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      const interfaceName = await this.getActiveInterface();
      const { stdout } = await this.execute(
        `netsh interface ip show dns "${interfaceName}"`
      );

      const dnsServers: string[] = [];
      const lines = stdout.split('\n');

      for (const line of lines) {
        const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (match && !dnsServers.includes(match[1])) {
          dnsServers.push(match[1]);
        }
      }

      return dnsServers;
    } catch {
      return [];
    }
  }

  async getStatus(): Promise<DnsStatus> {
    try {
      const activeDns = await this.getActiveDns();
      const interfaceName = await this.getActiveInterface();
      
      // Check if DNS is static
      const { stdout } = await this.execute(
        `netsh interface ip show dns "${interfaceName}"`
      );
      const isStatic = stdout.toLowerCase().includes('statically configured');
      
      return {
        isConnected: isStatic && activeDns.length > 0,
        activeDns,
      };
    } catch {
      return {
        isConnected: false,
        activeDns: [],
      };
    }
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const { stdout } = await this.execute('netsh interface show interface');
      const interfaces: NetworkInterface[] = [];
      const lines = stdout.split('\n').slice(3);

      for (const line of lines) {
        const parts = line.trim().split(/\s{2,}/);
        if (parts.length >= 4) {
          const [adminState, state, type, name] = parts;
          if (name && adminState === 'Enabled') {
            interfaces.push({
              name,
              displayName: name,
              type:
                name.toLowerCase().includes('wi-fi') ||
                name.toLowerCase().includes('wireless')
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

  setInterface(name: string): void {
    this.selectedInterface = name;
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
