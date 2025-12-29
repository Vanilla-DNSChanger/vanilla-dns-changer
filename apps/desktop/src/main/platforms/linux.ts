import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, access, constants } from 'fs/promises';
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
const NETPLAN_DIR = '/etc/netplan';

/**
 * Detected DNS manager type
 */
type DnsManager = 'networkmanager' | 'systemd-resolved' | 'netplan' | 'resolvconf' | 'direct';

/**
 * Linux Platform implementation
 * Supports multiple DNS management systems:
 * - NetworkManager (nmcli)
 * - systemd-resolved (resolvectl)
 * - Netplan
 * - Direct resolv.conf editing
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

    // Check for NetworkManager first (most common on desktop Linux)
    try {
      const { stdout } = await this.execute('which nmcli');
      if (stdout.trim()) {
        // Verify NetworkManager is running
        const { stdout: status } = await this.execute('systemctl is-active NetworkManager 2>/dev/null || echo inactive');
        if (status.trim() === 'active') {
          this.detectedManager = 'networkmanager';
          return this.detectedManager;
        }
      }
    } catch {}

    // Check for systemd-resolved
    try {
      const { stdout } = await this.execute('systemctl is-active systemd-resolved 2>/dev/null || echo inactive');
      if (stdout.trim() === 'active') {
        this.detectedManager = 'systemd-resolved';
        return this.detectedManager;
      }
    } catch {}

    // Check for resolvconf
    try {
      const { stdout } = await this.execute('which resolvconf');
      if (stdout.trim()) {
        this.detectedManager = 'resolvconf';
        return this.detectedManager;
      }
    } catch {}

    // Default to direct editing
    this.detectedManager = 'direct';
    return this.detectedManager;
  }

  /**
   * Get the active network connection name for NetworkManager
   */
  private async getActiveConnection(): Promise<string | null> {
    if (this.activeConnection) {
      return this.activeConnection;
    }

    try {
      // Get active connection with the default route
      const { stdout } = await this.execute(
        `nmcli -t -f NAME,TYPE,DEVICE connection show --active | grep -E '(ethernet|wifi|wireless)' | head -1 | cut -d: -f1`
      );
      
      const connectionName = stdout.trim();
      if (connectionName) {
        this.activeConnection = connectionName;
        return connectionName;
      }

      // Fallback: get any active connection
      const { stdout: fallback } = await this.execute(
        `nmcli -t -f NAME connection show --active | head -1`
      );
      
      if (fallback.trim()) {
        this.activeConnection = fallback.trim();
        return this.activeConnection;
      }
    } catch {}

    return null;
  }

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const manager = await this.detectDnsManager();
      
      switch (manager) {
        case 'networkmanager':
          return await this.setDnsNetworkManager(servers);
        case 'systemd-resolved':
          return await this.setDnsSystemdResolved(servers);
        default:
          return await this.setDnsDirect(servers);
      }
    } catch (error: any) {
      console.error('setDns error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set DNS using NetworkManager (nmcli)
   */
  private async setDnsNetworkManager(servers: string[]): Promise<DnsOperationResult> {
    const connection = await this.getActiveConnection();
    if (!connection) {
      return { success: false, error: 'No active network connection found' };
    }

    const dnsStr = servers.join(' ');
    
    try {
      // Set DNS servers for the connection
      await this.executeElevated(
        `nmcli connection modify "${connection}" ipv4.dns "${dnsStr}" ipv4.ignore-auto-dns yes`
      );

      // Restart the connection to apply changes
      await this.executeElevated(`nmcli connection down "${connection}" && nmcli connection up "${connection}"`);

      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      // Fallback to direct method
      console.error('NetworkManager method failed, falling back to direct:', error);
      return await this.setDnsDirect(servers);
    }
  }

  /**
   * Set DNS using systemd-resolved
   */
  private async setDnsSystemdResolved(servers: string[]): Promise<DnsOperationResult> {
    try {
      // Get the main interface
      const interfaces = await this.getNetworkInterfaces();
      const activeInterface = interfaces.find(i => i.isActive);
      
      if (!activeInterface) {
        return await this.setDnsDirect(servers);
      }

      // Use resolvectl to set DNS
      const dnsStr = servers.join(' ');
      await this.executeElevated(
        `resolvectl dns ${activeInterface.name} ${dnsStr}`
      );

      // Set this as the default DNS
      await this.executeElevated(
        `resolvectl default-route ${activeInterface.name} yes`
      );

      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      // Fallback to direct method
      console.error('systemd-resolved method failed, falling back to direct:', error);
      return await this.setDnsDirect(servers);
    }
  }

  /**
   * Set DNS by directly modifying resolv.conf
   */
  private async setDnsDirect(servers: string[]): Promise<DnsOperationResult> {
    try {
      // Backup original resolv.conf
      const original = await readFile(RESOLV_CONF, 'utf8').catch(() => '');
      if (original && !original.includes('# Vanilla DNS')) {
        await this.executeElevated(`cp ${RESOLV_CONF} ${RESOLV_BACKUP}`);
      }

      // Check if resolv.conf is a symlink (common with systemd-resolved)
      try {
        const { stdout } = await this.execute(`readlink ${RESOLV_CONF} 2>/dev/null || echo ""`);
        if (stdout.includes('stub-resolv.conf') || stdout.includes('systemd')) {
          // Remove the symlink and create a regular file
          await this.executeElevated(`rm -f ${RESOLV_CONF}`);
        }
      } catch {}

      // Create new resolv.conf content
      const content = [
        '# Vanilla DNS Changer - Modified',
        '# Original backed up to /etc/resolv.conf.vanilla-backup',
        ...servers.map(s => `nameserver ${s}`),
        '',
      ].join('\n');

      // Write new resolv.conf
      await this.executeElevated(`echo '${content}' > ${RESOLV_CONF}`);

      // Make it immutable to prevent other services from overwriting
      // (optional - can be disabled by user)
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
      
      switch (manager) {
        case 'networkmanager':
          return await this.clearDnsNetworkManager();
        case 'systemd-resolved':
          return await this.clearDnsSystemdResolved();
        default:
          return await this.clearDnsDirect();
      }
    } catch (error: any) {
      console.error('clearDns error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear DNS using NetworkManager
   */
  private async clearDnsNetworkManager(): Promise<DnsOperationResult> {
    const connection = await this.getActiveConnection();
    if (!connection) {
      return await this.clearDnsDirect();
    }

    try {
      // Reset DNS settings to auto
      await this.executeElevated(
        `nmcli connection modify "${connection}" ipv4.dns "" ipv4.ignore-auto-dns no`
      );

      // Restart the connection
      await this.executeElevated(`nmcli connection down "${connection}" && nmcli connection up "${connection}"`);

      // Clear cached connection
      this.activeConnection = null;

      return { success: true, message: 'DNS reset to default' };
    } catch (error: any) {
      return await this.clearDnsDirect();
    }
  }

  /**
   * Clear DNS using systemd-resolved
   */
  private async clearDnsSystemdResolved(): Promise<DnsOperationResult> {
    try {
      // Restore the symlink to stub-resolv.conf if it was removed
      await this.executeElevated(
        `ln -sf /run/systemd/resolve/stub-resolv.conf ${RESOLV_CONF} 2>/dev/null || true`
      );

      // Restart systemd-resolved
      await this.executeElevated('systemctl restart systemd-resolved');

      return { success: true, message: 'DNS reset to default' };
    } catch (error: any) {
      return await this.clearDnsDirect();
    }
  }

  /**
   * Clear DNS by restoring the backup
   */
  private async clearDnsDirect(): Promise<DnsOperationResult> {
    try {
      // Remove immutable flag if set
      try {
        await this.executeElevated(`chattr -i ${RESOLV_CONF} 2>/dev/null || true`);
      } catch {}

      // Check if backup exists
      try {
        await access(RESOLV_BACKUP, constants.F_OK);
        await this.executeElevated(`cp ${RESOLV_BACKUP} ${RESOLV_CONF}`);
      } catch {
        // No backup, try to restore symlink for systemd-resolved
        try {
          const { stdout } = await this.execute('systemctl is-active systemd-resolved 2>/dev/null || echo inactive');
          if (stdout.trim() === 'active') {
            await this.executeElevated(`ln -sf /run/systemd/resolve/stub-resolv.conf ${RESOLV_CONF}`);
            await this.executeElevated('systemctl restart systemd-resolved');
          }
        } catch {}
      }

      // Try to restart network services
      await this.execute('systemctl restart systemd-resolved 2>/dev/null || true').catch(() => {});
      await this.execute('systemctl restart NetworkManager 2>/dev/null || true').catch(() => {});

      return { success: true, message: 'DNS reset to default' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getActiveDns(): Promise<string[]> {
    const manager = await this.detectDnsManager();
    
    try {
      switch (manager) {
        case 'networkmanager':
          return await this.getActiveDnsNetworkManager();
        case 'systemd-resolved':
          return await this.getActiveDnsSystemdResolved();
        default:
          return await this.getActiveDnsDirect();
      }
    } catch {
      return await this.getActiveDnsDirect();
    }
  }

  /**
   * Get active DNS from NetworkManager
   */
  private async getActiveDnsNetworkManager(): Promise<string[]> {
    try {
      // Get DNS servers from nmcli
      const { stdout } = await this.execute(
        `nmcli -t -f IP4.DNS device show 2>/dev/null | grep -oP '\\d+\\.\\d+\\.\\d+\\.\\d+' | head -4`
      );
      
      const servers = stdout.trim().split('\n').filter(s => s && s.match(/^\d+\.\d+\.\d+\.\d+$/));
      if (servers.length > 0) {
        return servers;
      }
    } catch {}

    return await this.getActiveDnsDirect();
  }

  /**
   * Get active DNS from systemd-resolved
   */
  private async getActiveDnsSystemdResolved(): Promise<string[]> {
    try {
      const { stdout } = await this.execute(
        `resolvectl status 2>/dev/null | grep -oP 'DNS Servers:\\s*\\K[\\d.]+' || resolvectl dns 2>/dev/null | grep -oP '\\d+\\.\\d+\\.\\d+\\.\\d+'`
      );
      
      const servers = stdout.trim().split('\n').filter(s => s && s.match(/^\d+\.\d+\.\d+\.\d+$/));
      if (servers.length > 0) {
        return servers;
      }
    } catch {}

    return await this.getActiveDnsDirect();
  }

  /**
   * Get active DNS from resolv.conf
   */
  private async getActiveDnsDirect(): Promise<string[]> {
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
    const interfaces = await this.getNetworkInterfaces();
    const activeInterface = interfaces.find(i => i.isActive);

    // Check if using our DNS
    let isVanillaDns = false;
    try {
      const content = await readFile(RESOLV_CONF, 'utf8');
      isVanillaDns = content.includes('# Vanilla DNS');
    } catch {}

    // Also check if using NetworkManager with custom DNS
    if (!isVanillaDns && await this.detectDnsManager() === 'networkmanager') {
      try {
        const connection = await this.getActiveConnection();
        if (connection) {
          const { stdout } = await this.execute(
            `nmcli -t -f ipv4.ignore-auto-dns connection show "${connection}" 2>/dev/null`
          );
          if (stdout.includes('yes')) {
            isVanillaDns = true;
          }
        }
      } catch {}
    }

    return {
      isConnected: isVanillaDns && activeDns.length > 0,
      activeDns,
      activeInterface,
    };
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      // Try ip command first (most reliable)
      const { stdout } = await this.execute(
        `ip -o link show 2>/dev/null | grep -v "lo:" | awk '{print $2}' | tr -d ':'`
      );
      
      const interfaces: NetworkInterface[] = [];
      const names = stdout.split('\n').filter(l => l.trim());

      for (const name of names) {
        try {
          // Check if interface is UP
          const { stdout: state } = await this.execute(`cat /sys/class/net/${name}/operstate 2>/dev/null || echo unknown`);
          const isUp = state.trim() === 'up';

          // Get IP address
          let ip: string | undefined;
          try {
            const { stdout: ipOut } = await this.execute(`ip -4 addr show ${name} 2>/dev/null | grep -oP 'inet \\K[\\d.]+'`);
            ip = ipOut.trim() || undefined;
          } catch {}

          interfaces.push({
            name,
            displayName: name,
            type: this.getInterfaceType(name),
            isActive: isUp && ip !== undefined,
            ip,
          });
        } catch {}
      }

      // Sort so active interfaces come first
      interfaces.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));

      return interfaces;
    } catch {
      return [];
    }
  }

  private getInterfaceType(name: string): 'wifi' | 'ethernet' | 'other' {
    if (name.startsWith('wl') || name.startsWith('wlan')) {
      return 'wifi';
    }
    if (name.startsWith('eth') || name.startsWith('en') || name.startsWith('eno') || name.startsWith('enp')) {
      return 'ethernet';
    }
    return 'other';
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      // Try different methods based on system
      const commands = [
        'resolvectl flush-caches',
        'systemd-resolve --flush-caches',
        'nscd -i hosts',
        'service nscd restart',
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
    return execAsync(command, { encoding: 'utf8', timeout: 15000 });
  }
}
