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

      return [];
    } catch {
      // Fallback to netsh
      return this.getActiveDnsNetsh();
    }
  }

  /**
   * Check if DNS is configured statically (not via DHCP)
   * This is the key method to determine if user has manually set DNS
   */
  private async isDnsSetStatically(interfaceName: string): Promise<boolean> {
    try {
      // Method 1: Check via WMI if DNS is obtained from DHCP
      const { stdout } = await this.executePowerShell(
        `Get-WmiObject Win32_NetworkAdapterConfiguration | Where-Object { $_.Description -like "*${interfaceName}*" -or $_.Index -eq (Get-NetAdapter -Name "${interfaceName}" -ErrorAction SilentlyContinue).InterfaceIndex } | Select-Object -ExpandProperty DHCPEnabled`
      );
      
      // If DHCP is enabled, we need to check if DNS is also from DHCP or manually set
      // Method 2: Check the interface configuration directly
      const { stdout: dnsConfigStdout } = await this.executePowerShell(
        `Get-DnsClient -InterfaceAlias "${interfaceName}" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty RegisterThisConnectionsAddress`
      );

      // Method 3: Check netsh to see if DNS is "Statically Configured" vs "DHCP"
      const { stdout: netshOutput } = await this.execute(
        `netsh interface ip show dns name="${interfaceName}"`
      );
      
      // Parse netsh output to check if DNS is statically configured
      const lines = netshOutput.toLowerCase();
      if (lines.includes('statically configured') || lines.includes('static')) {
        return true;
      }
      if (lines.includes('dhcp') || lines.includes('configured through dhcp')) {
        return false;
      }

      // If we can't determine from netsh, assume DNS servers indicate static config
      // (only if they are known DNS providers, not typical DHCP-assigned DNS)
      return false;
    } catch {
      return false;
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
    const interfaces = await this.getNetworkInterfaces();
    const activeInterface = interfaces.find(i => i.isActive);
    
    // Update selected interface
    if (activeInterface && !this.selectedInterface) {
      this.selectedInterface = activeInterface.name;
    }

    const interfaceName = this.selectedInterface || activeInterface?.name;
    
    if (!interfaceName) {
      return {
        isConnected: false,
        activeDns: [],
        activeInterface: undefined,
      };
    }

    // Get current DNS servers
    const activeDns = await this.getActiveDns();
    
    // Check if DNS is set statically (most important check)
    const isStatic = await this.isDnsSetStatically(interfaceName);
    
    // Known DNS providers - if DNS is static AND matches these, we're connected
    const knownDnsProviders = [
      // Google
      '8.8.8.8', '8.8.4.4',
      // Cloudflare
      '1.1.1.1', '1.0.0.1',
      // Quad9
      '9.9.9.9', '149.112.112.112',
      // OpenDNS
      '208.67.222.222', '208.67.220.220',
      // Level3
      '4.2.2.4', '4.2.2.1', '4.2.2.2', '4.2.2.3',
      // CleanBrowsing
      '185.228.168.9', '185.228.169.9',
      // AdGuard
      '94.140.14.14', '94.140.15.15',
      // Shecan (Iran)
      '178.22.122.100', '178.22.122.101',
      // 403 (Iran)
      '10.202.10.202', '10.202.10.102',
      // Electro/Radar (Iran)
      '78.157.42.100', '78.157.42.101',
      // Pishgaman (Iran)
      '5.202.100.100', '5.202.100.101',
      // Begzar (Iran)
      '185.55.226.26', '185.55.225.25',
      // Shatel (Iran)
      '85.15.1.14', '85.15.1.15',
    ];

    // Filter out invalid addresses
    const validDnsServers = activeDns.filter(dns => {
      if (!dns || dns === '0.0.0.0') return false;
      if (dns.startsWith('fec0:') || dns.startsWith('fe80:')) return false;
      if (dns.startsWith('169.254.')) return false;
      if (dns.startsWith('127.')) return false;
      return true;
    });

    // Determine connection status:
    // 1. If DNS is set statically AND at least one DNS is a known provider = Connected
    // 2. If DNS is set statically but not a known provider = Still connected (custom DNS)
    // 3. If DNS is from DHCP = Not connected (even if there are DNS servers)
    let isConnected = false;
    let matchedServer = '';

    if (isStatic && validDnsServers.length > 0) {
      // Check if any DNS matches known providers
      for (const dns of validDnsServers) {
        if (knownDnsProviders.includes(dns)) {
          isConnected = true;
          matchedServer = dns;
          break;
        }
      }
      
      // Even if not a known provider, if static DNS is set, consider connected
      // (user might have set a custom DNS)
      if (!isConnected) {
        // Only consider connected if DNS doesn't look like a gateway/router
        const isGatewayLike = validDnsServers.every(dns => 
          dns.endsWith('.1') || 
          dns.startsWith('192.168.') ||
          (dns.startsWith('10.') && !knownDnsProviders.includes(dns))
        );
        
        if (!isGatewayLike) {
          isConnected = true;
        }
      }
    }

    return {
      isConnected,
      activeDns: validDnsServers,
      activeInterface,
      serverName: matchedServer || undefined,
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
