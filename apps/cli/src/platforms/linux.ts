import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, access, constants } from 'fs/promises';
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
 * Detected DNS manager type
 */
type DnsManager = 'networkmanager' | 'systemd-resolved' | 'direct';

/**
 * Linux Platform implementation for CLI
 * Supports NetworkManager, systemd-resolved, and direct resolv.conf editing
 */
export class LinuxPlatform extends Platform {
  readonly type = 'linux' as const;
  private detectedManager: DnsManager | null = null;
  private activeConnection: string | null = null;

  /**
   * Detect the DNS management system in use
   */
  private async detectDnsManager(): Promise<DnsManager> {
    if (this.detectedManager) {
      return this.detectedManager;
    }

    // Check for NetworkManager first
    try {
      const { stdout } = await this.execute('which nmcli 2>/dev/null');
      if (stdout.trim()) {
        const { stdout: status } = await this.execute(
          'systemctl is-active NetworkManager 2>/dev/null || echo inactive'
        );
        if (status.trim() === 'active') {
          this.detectedManager = 'networkmanager';
          return this.detectedManager;
        }
      }
    } catch {}

    // Check for systemd-resolved
    try {
      const { stdout } = await this.execute(
        'systemctl is-active systemd-resolved 2>/dev/null || echo inactive'
      );
      if (stdout.trim() === 'active') {
        this.detectedManager = 'systemd-resolved';
        return this.detectedManager;
      }
    } catch {}

    this.detectedManager = 'direct';
    return this.detectedManager;
  }

  /**
   * Get the active network connection for NetworkManager
   */
  private async getActiveConnection(): Promise<string | null> {
    if (this.activeConnection) {
      return this.activeConnection;
    }

    try {
      const { stdout } = await this.execute(
        `nmcli -t -f NAME,TYPE,DEVICE connection show --active | grep -E '(ethernet|wifi)' | head -1 | cut -d: -f1`
      );
      
      if (stdout.trim()) {
        this.activeConnection = stdout.trim();
        return this.activeConnection;
      }
    } catch {}

    return null;
  }

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const manager = await this.detectDnsManager();

      if (manager === 'networkmanager') {
        return await this.setDnsNetworkManager(servers);
      } else {
        return await this.setDnsDirect(servers);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async setDnsNetworkManager(
    servers: string[]
  ): Promise<DnsOperationResult> {
    const connection = await this.getActiveConnection();
    if (!connection) {
      return await this.setDnsDirect(servers);
    }

    const dnsStr = servers.join(' ');

    try {
      await this.executeElevated(
        `nmcli connection modify "${connection}" ipv4.dns "${dnsStr}" ipv4.ignore-auto-dns yes`
      );
      await this.executeElevated(
        `nmcli connection down "${connection}" && nmcli connection up "${connection}"`
      );
      return { success: true, message: 'DNS servers updated successfully' };
    } catch {
      return await this.setDnsDirect(servers);
    }
  }

  private async setDnsDirect(servers: string[]): Promise<DnsOperationResult> {
    try {
      const original = await readFile(RESOLV_CONF, 'utf8').catch(() => '');
      if (original && !original.includes('# Vanilla DNS')) {
        await this.executeElevated(`cp ${RESOLV_CONF} ${RESOLV_BACKUP}`);
      }

      // Check if resolv.conf is a symlink
      try {
        const { stdout } = await this.execute(`readlink ${RESOLV_CONF} 2>/dev/null || echo ""`);
        if (stdout.includes('stub-resolv.conf') || stdout.includes('systemd')) {
          await this.executeElevated(`rm -f ${RESOLV_CONF}`);
        }
      } catch {}

      const content = [
        '# Vanilla DNS Changer - Modified',
        '# Original backed up to /etc/resolv.conf.vanilla-backup',
        ...servers.map((s) => `nameserver ${s}`),
        '',
      ].join('\n');

      await this.executeElevated(`echo '${content}' > ${RESOLV_CONF}`);

      // Make immutable
      try {
        await this.executeElevated(`chattr +i ${RESOLV_CONF}`);
      } catch {}

      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      const manager = await this.detectDnsManager();

      if (manager === 'networkmanager') {
        return await this.clearDnsNetworkManager();
      } else {
        return await this.clearDnsDirect();
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async clearDnsNetworkManager(): Promise<DnsOperationResult> {
    const connection = await this.getActiveConnection();
    if (!connection) {
      return await this.clearDnsDirect();
    }

    try {
      await this.executeElevated(
        `nmcli connection modify "${connection}" ipv4.dns "" ipv4.ignore-auto-dns no`
      );
      await this.executeElevated(
        `nmcli connection down "${connection}" && nmcli connection up "${connection}"`
      );
      this.activeConnection = null;
      return { success: true, message: 'DNS reset to default' };
    } catch {
      return await this.clearDnsDirect();
    }
  }

  private async clearDnsDirect(): Promise<DnsOperationResult> {
    try {
      // Remove immutable flag
      try {
        await this.executeElevated(`chattr -i ${RESOLV_CONF} 2>/dev/null || true`);
      } catch {}

      // Restore backup or recreate symlink
      try {
        await access(RESOLV_BACKUP, constants.F_OK);
        await this.executeElevated(`cp ${RESOLV_BACKUP} ${RESOLV_CONF}`);
      } catch {
        try {
          const { stdout } = await this.execute(
            'systemctl is-active systemd-resolved 2>/dev/null || echo inactive'
          );
          if (stdout.trim() === 'active') {
            await this.executeElevated(
              `ln -sf /run/systemd/resolve/stub-resolv.conf ${RESOLV_CONF}`
            );
            await this.executeElevated('systemctl restart systemd-resolved');
          }
        } catch {}
      }

      await this.execute('systemctl restart systemd-resolved 2>/dev/null || true').catch(() => {});
      await this.execute('systemctl restart NetworkManager 2>/dev/null || true').catch(() => {});

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

    let isVanillaDns = false;
    try {
      const content = await readFile(RESOLV_CONF, 'utf8');
      isVanillaDns = content.includes('# Vanilla DNS');
    } catch {}

    // Also check NetworkManager
    if (!isVanillaDns) {
      try {
        const manager = await this.detectDnsManager();
        if (manager === 'networkmanager') {
          const connection = await this.getActiveConnection();
          if (connection) {
            const { stdout } = await this.execute(
              `nmcli -t -f ipv4.ignore-auto-dns connection show "${connection}" 2>/dev/null`
            );
            if (stdout.includes('yes')) {
              isVanillaDns = true;
            }
          }
        }
      } catch {}
    }

    return {
      isConnected: isVanillaDns && activeDns.length > 0,
      activeDns,
    };
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const { stdout } = await this.execute(
        `ip -o link show 2>/dev/null | grep -v "lo:" | awk '{print $2}' | tr -d ':'`
      );

      const interfaces: NetworkInterface[] = [];
      const names = stdout.split('\n').filter((l) => l.trim());

      for (const name of names) {
        try {
          const { stdout: state } = await this.execute(
            `cat /sys/class/net/${name}/operstate 2>/dev/null || echo unknown`
          );
          const isUp = state.trim() === 'up';

          let ip: string | undefined;
          try {
            const { stdout: ipOut } = await this.execute(
              `ip -4 addr show ${name} 2>/dev/null | grep -oP 'inet \\K[\\d.]+'`
            );
            ip = ipOut.trim() || undefined;
          } catch {}

          interfaces.push({
            name,
            displayName: name,
            type: name.startsWith('wl')
              ? 'wifi'
              : name.startsWith('eth') || name.startsWith('en')
              ? 'ethernet'
              : 'other',
            isActive: isUp && ip !== undefined,
            ip,
          });
        } catch {}
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
        'resolvectl flush-caches',
        'systemd-resolve --flush-caches',
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
