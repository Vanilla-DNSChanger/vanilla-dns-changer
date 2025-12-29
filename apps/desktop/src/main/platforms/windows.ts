import { exec, execSync } from 'child_process';
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
 * Uses PowerShell for DNS operations which works better with admin privileges
 */
export class WindowsPlatform extends Platform {
  readonly type = 'windows' as const;
  private selectedInterface: string | null = null;

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      // Auto-detect active interface if not set
      if (!this.selectedInterface) {
        const interfaces = await this.getNetworkInterfaces();
        const activeInterface = interfaces.find(i => i.isActive);
        if (activeInterface) {
          this.selectedInterface = activeInterface.name;
        } else {
          return { success: false, error: 'No active network interface found' };
        }
      }

      const [primary, secondary] = servers;
      const dnsArray = secondary ? `"${primary}","${secondary}"` : `"${primary}"`;
      
      // Use PowerShell Set-DnsClientServerAddress which is more reliable
      const psCommand = `Set-DnsClientServerAddress -InterfaceAlias "${this.selectedInterface}" -ServerAddresses ${dnsArray}`;
      
      await this.executePowerShell(psCommand);
      
      // Flush DNS cache after setting
      await this.flushDnsCache();

      return { success: true, message: 'DNS servers updated successfully' };
    } catch (error: any) {
      // Fallback to netsh if PowerShell fails
      try {
        return await this.setDnsNetsh(servers);
      } catch (fallbackError: any) {
        return { success: false, error: error.message || fallbackError.message };
      }
    }
  }

  private async setDnsNetsh(servers: string[]): Promise<DnsOperationResult> {
    const [primary, secondary] = servers;
    
    // Set primary DNS
    await this.execute(
      `netsh interface ip set dns name="${this.selectedInterface}" static ${primary}`
    );
    
    // Set secondary DNS if provided
    if (secondary) {
      await this.execute(
        `netsh interface ip add dns name="${this.selectedInterface}" ${secondary} index=2`
      );
    }

    return { success: true, message: 'DNS servers updated successfully' };
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      if (!this.selectedInterface) {
        const interfaces = await this.getNetworkInterfaces();
        const activeInterface = interfaces.find(i => i.isActive);
        if (activeInterface) {
          this.selectedInterface = activeInterface.name;
        }
      }

      // Use PowerShell to reset to DHCP
      const psCommand = `Set-DnsClientServerAddress -InterfaceAlias "${this.selectedInterface}" -ResetServerAddresses`;
      await this.executePowerShell(psCommand);
      
      // Flush DNS cache
      await this.flushDnsCache();

      return { success: true, message: 'DNS reset to DHCP' };
    } catch (error: any) {
      // Fallback to netsh
      try {
        await this.execute(
          `netsh interface ip set dns name="${this.selectedInterface}" dhcp`
        );
        return { success: true, message: 'DNS reset to DHCP' };
      } catch (fallbackError: any) {
        return { success: false, error: error.message };
      }
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      // Get the interface to check
      let interfaceToCheck = this.selectedInterface;
      if (!interfaceToCheck) {
        const interfaces = await this.getNetworkInterfaces();
        const activeInterface = interfaces.find(i => i.isActive);
        if (activeInterface) {
          interfaceToCheck = activeInterface.name;
        }
      }

      if (interfaceToCheck) {
        // Use PowerShell to get DNS specifically for the interface
        const { stdout } = await this.executePowerShell(
          `Get-DnsClientServerAddress -InterfaceAlias "${interfaceToCheck}" -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses`
        );
        
        const dnsServers = stdout.trim().split(/\r?\n/).filter(s => s && s.trim() !== '');
        if (dnsServers.length > 0) {
          return dnsServers;
        }
      }

      // Fallback: get DNS from any active interface that has DNS configured
      const { stdout: allDns } = await this.executePowerShell(
        `Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.ServerAddresses.Count -gt 0 } | Select-Object -First 1 -ExpandProperty ServerAddresses`
      );
      
      return allDns.trim().split(/\r?\n/).filter(s => s && s.trim() !== '');
    } catch {
      // Fallback to netsh
      return this.getActiveDnsNetsh();
    }
  }

  private async getActiveDnsNetsh(): Promise<string[]> {
    try {
      const { stdout } = await this.execute(
        `netsh interface ip show dns`
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
    const activeDns = await this.getActiveDns();
    const interfaces = await this.getNetworkInterfaces();
    const activeInterface = interfaces.find(i => i.isActive);
    
    // Update selected interface
    if (activeInterface && !this.selectedInterface) {
      this.selectedInterface = activeInterface.name;
    }

    // Filter out non-DNS addresses (like adapter IPs)
    // DNS servers are usually well-known public IPs or specific DNS providers
    const validDnsServers = activeDns.filter(dns => {
      if (!dns || dns === '0.0.0.0') return false;
      // Skip IPv6 link-local
      if (dns.startsWith('fec0:') || dns.startsWith('fe80:')) return false;
      // Skip APIPA (169.254.x.x)
      if (dns.startsWith('169.254.')) return false;
      // Skip localhost
      if (dns.startsWith('127.')) return false;
      
      // Check if this looks like a valid DNS (not a random private IP)
      // Common private IP ranges that are NOT typically DNS:
      // 10.x.x.x - usually VPN/internal but some like 10.127.x.x might be adapter IPs
      // Most valid DNS are well-known: 8.8.8.8, 1.1.1.1, 4.2.2.4, etc.
      return true;
    });

    // Determine if we're connected to a custom DNS
    // If DNS array is empty or only contains router/DHCP DNS, we're not connected
    const isCustomDns = validDnsServers.length > 0 && validDnsServers.some(dns => {
      // Known public DNS providers
      const knownDns = [
        '8.8.8.8', '8.8.4.4',           // Google
        '1.1.1.1', '1.0.0.1',           // Cloudflare
        '9.9.9.9', '149.112.112.112',   // Quad9
        '208.67.222.222', '208.67.220.220', // OpenDNS
        '4.2.2.4', '4.2.2.1', '4.2.2.2', '4.2.2.3', // Level3
        '185.228.168.9', '185.228.169.9', // CleanBrowsing
        '76.76.19.19', '76.223.122.150', // Alternate DNS
        '94.140.14.14', '94.140.15.15', // AdGuard
        '78.157.42.100', '78.157.42.101', // Shecan
        '10.202.10.202', '10.202.10.102', // 403
        '178.22.122.100', '185.51.200.2', // Electro/Radar
        '5.202.100.100', '5.202.100.101', // Pishgaman
      ];
      
      // If it's a known DNS, definitely connected
      if (knownDns.includes(dns)) return true;
      
      // Skip common router/gateway addresses
      if (dns.match(/^192\.168\.\d+\.1$/)) return false;
      if (dns === '192.168.1.1' || dns === '192.168.0.1') return false;
      if (dns.match(/^10\.\d+\.\d+\.1$/)) return false;
      
      // Consider other IPs as potentially custom DNS
      return !dns.startsWith('192.168.') && !dns.startsWith('172.16.') && 
             !dns.startsWith('172.17.') && !dns.startsWith('172.18.') &&
             !dns.startsWith('172.19.') && !dns.startsWith('172.2') &&
             !dns.startsWith('172.30.') && !dns.startsWith('172.31.');
    });

    return {
      isConnected: isCustomDns,
      activeDns: validDnsServers,
      activeInterface,
    };
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      // Use PowerShell for more reliable interface detection
      const { stdout } = await this.executePowerShell(
        `Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -or $_.Status -eq 'Disconnected' } | Select-Object Name, InterfaceDescription, Status, MediaType | ConvertTo-Json`
      );
      
      const adapters = JSON.parse(stdout || '[]');
      const adapterArray = Array.isArray(adapters) ? adapters : [adapters];
      
      return adapterArray.map((adapter: any) => ({
        name: adapter.Name,  // Use the short name (e.g., "Ethernet 2") for operations
        displayName: adapter.Name, // Show the short name to user, not the long description
        type: this.getInterfaceType(adapter.Name, adapter.MediaType),
        isActive: adapter.Status === 'Up',
      }));
    } catch {
      // Fallback to netsh
      return this.getNetworkInterfacesNetsh();
    }
  }

  private async getNetworkInterfacesNetsh(): Promise<NetworkInterface[]> {
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
              type: this.getInterfaceType(name, type),
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

  private getInterfaceType(name: string, mediaType?: string): 'wifi' | 'ethernet' | 'other' {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('wi-fi') || nameLower.includes('wireless') || nameLower.includes('wlan')) {
      return 'wifi';
    }
    if (nameLower.includes('ethernet') || nameLower.includes('local area')) {
      return 'ethernet';
    }
    return 'other';
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      await this.execute('ipconfig /flushdns');
      return { success: true, message: 'DNS cache flushed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async pingServer(server: string): Promise<PingResult> {
    try {
      const start = Date.now();
      await this.execute(`ping -n 1 -w 2000 ${server}`);
      const latency = Date.now() - start;
      return { server, latency, success: true };
    } catch (error: any) {
      return { server, latency: -1, success: false, error: error.message };
    }
  }

  async isElevated(): Promise<boolean> {
    try {
      // Check if running as administrator
      const { stdout } = await this.executePowerShell(
        `([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")`
      );
      return stdout.trim().toLowerCase() === 'true';
    } catch {
      return false;
    }
  }

  setInterface(interfaceName: string) {
    this.selectedInterface = interfaceName;
  }

  private async executePowerShell(command: string): Promise<{ stdout: string; stderr: string }> {
    const psCommand = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${command.replace(/"/g, '\\"')}"`;
    return execAsync(psCommand, { encoding: 'utf8', timeout: 10000 });
  }

  protected async execute(command: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, { encoding: 'utf8', timeout: 10000 });
  }
}
