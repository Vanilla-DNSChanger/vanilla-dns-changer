import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import {
  Platform,
  DnsStatus,
  DnsOperationResult,
  NetworkInterface,
  PingResult,
} from '@vanilla-dns/shared';

const execAsync = promisify(exec);

const RESOLV_CONF = '/etc/resolv.conf';
const RESOLV_BACKUP = '/etc/resolv.conf.vanilla-backup';

/**
 * Linux Platform implementation
 */
export class LinuxPlatform extends Platform {
  readonly type = 'linux' as const;

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      // Backup original resolv.conf
      const original = await readFile(RESOLV_CONF, 'utf8').catch(() => '');
      if (original && !original.includes('# Vanilla DNS')) {
        await this.executeElevated(`cp ${RESOLV_CONF} ${RESOLV_BACKUP}`);
      }

      // Create new resolv.conf content
      const content = [
        '# Vanilla DNS Changer - Modified',
        '# Original backed up to /etc/resolv.conf.vanilla-backup',
        ...servers.map(s => `nameserver ${s}`),
        '',
      ].join('\n');

      // Write new resolv.conf
      await this.executeElevated(`echo '${content}' > ${RESOLV_CONF}`);

      // Try to restart systemd-resolved if available
      await this.execute('systemctl restart systemd-resolved').catch(() => {});

      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      // Restore backup if exists
      await this.executeElevated(`[ -f ${RESOLV_BACKUP} ] && cp ${RESOLV_BACKUP} ${RESOLV_CONF}`);
      
      // Restart systemd-resolved
      await this.execute('systemctl restart systemd-resolved').catch(() => {});
      
      return { success: true, message: 'DNS reset to default' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      const content = await readFile(RESOLV_CONF, 'utf8');
      const servers: string[] = [];
      
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(/^nameserver\s+(\d+\.\d+\.\d+\.\d+)/);
        if (match) {
          servers.push(match[1]);
        }
      }
      
      return servers;
    } catch {
      return [];
    }
  }

  async getStatus(): Promise<DnsStatus> {
    const activeDns = await this.getActiveDns();
    
    // Check if using our DNS
    let isVanillaDns = false;
    try {
      const content = await readFile(RESOLV_CONF, 'utf8');
      isVanillaDns = content.includes('# Vanilla DNS');
    } catch {}

    return {
      isConnected: isVanillaDns && activeDns.length > 0,
      activeDns,
    };
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const { stdout } = await this.execute('ip -o link show | grep -v "lo:"');
      const interfaces: NetworkInterface[] = [];
      
      const lines = stdout.split('\n').filter(l => l.trim());
      for (const line of lines) {
        const match = line.match(/^\d+:\s+(\w+)/);
        if (match) {
          const name = match[1];
          const isUp = line.includes('state UP');
          
          interfaces.push({
            name,
            displayName: name,
            type: name.startsWith('wl') ? 'wifi' : name.startsWith('eth') || name.startsWith('en') ? 'ethernet' : 'other',
            isActive: isUp,
          });
        }
      }
      
      return interfaces;
    } catch {
      return [];
    }
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      // Try different methods based on system
      const commands = [
        'systemd-resolve --flush-caches',
        'resolvectl flush-caches',
        'nscd -i hosts',
      ];

      for (const cmd of commands) {
        try {
          await this.executeElevated(cmd);
          return { success: true, message: 'DNS cache flushed successfully' };
        } catch {
          continue;
        }
      }

      return { success: true, message: 'DNS cache flush attempted' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async pingServer(server: string): Promise<PingResult> {
    try {
      const start = Date.now();
      await this.execute(`ping -c 1 -W 3 ${server}`);
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
    return execAsync(command, { encoding: 'utf8' });
  }
}
