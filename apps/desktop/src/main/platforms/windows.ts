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
 * Uses PowerShell and netsh for DNS operations
 * No external dependencies - pure Windows commands
 */
export class WindowsPlatform extends Platform {
  readonly type = 'windows' as const;
  private selectedInterface: string | null = null;
  private cachedInterfaceName: string | null = null;

  /**
   * Get the active network interface name using PowerShell
   * This is the most reliable method for Windows
   */
  private async detectActiveInterface(): Promise<string> {
    // Return cached value if available
    if (this.cachedInterfaceName) {
      return this.cachedInterfaceName;
    }

    // Method 1: Use Get-NetRoute to find the interface with default route
    try {
      const { stdout } = await this.executePowerShell(
        `(Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object -Property RouteMetric | Select-Object -First 1).InterfaceAlias`
      );
      const interfaceName = stdout.trim();
      if (interfaceName && !interfaceName.includes('error') && interfaceName.length > 0) {
        console.log('Detected interface via Get-NetRoute:', interfaceName);
        this.cachedInterfaceName = interfaceName;
        return interfaceName;
      }
    } catch (e) {
      console.log('Get-NetRoute method failed:', e);
    }

    // Method 2: Use Get-NetAdapter to find connected adapter
    try {
      const { stdout } = await this.executePowerShell(
        `(Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -First 1).Name`
      );
      const interfaceName = stdout.trim();
      if (interfaceName && !interfaceName.includes('error') && interfaceName.length > 0) {
        console.log('Detected interface via Get-NetAdapter:', interfaceName);
        this.cachedInterfaceName = interfaceName;
        return interfaceName;
      }
    } catch (e) {
      console.log('Get-NetAdapter method failed:', e);
    }

    // Method 3: Use netsh to find connected interface
    try {
      const { stdout } = await this.execute('netsh interface show interface');
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('Connected') && line.includes('Enabled')) {
          const parts = line.trim().split(/\s{2,}/);
          if (parts.length >= 4) {
            const interfaceName = parts[3];
            console.log('Detected interface via netsh:', interfaceName);
            this.cachedInterfaceName = interfaceName;
            return interfaceName;
          }
        }
      }
    } catch (e) {
      console.log('netsh method failed:', e);
    }

    // Method 4: Common interface names fallback
    const commonNames = ['Wi-Fi', 'Ethernet', 'Ethernet 2', 'Local Area Connection'];
    for (const name of commonNames) {
      try {
        const { stdout } = await this.execute(`netsh interface show interface name="${name}"`);
        if (stdout.toLowerCase().includes('connected')) {
          console.log('Detected interface via common names:', name);
          this.cachedInterfaceName = name;
          return name;
        }
      } catch {
        continue;
      }
    }

    throw new Error('No active network interface found. Please check your internet connection.');
  }

  /**
   * Get the interface name to use for DNS operations
   */
  private async getInterfaceName(): Promise<string> {
    if (this.selectedInterface && this.selectedInterface !== 'Auto') {
      return this.selectedInterface;
    }
    return await this.detectActiveInterface();
  }

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const [primary, secondary] = servers;

      // Validate primary server
      if (!primary || !this.isValidIp(primary)) {
        return { success: false, error: 'Invalid primary DNS server address' };
      }

      // Get interface name
      let interfaceName: string;
      try {
        interfaceName = await this.getInterfaceName();
      } catch (e: any) {
        return { success: false, error: e.message };
      }

      console.log(`Setting DNS for interface: "${interfaceName}"`);
      console.log(`Primary DNS: ${primary}, Secondary DNS: ${secondary || 'none'}`);

      // Try PowerShell method first (more reliable on modern Windows)
      try {
        const dnsServers = secondary && this.isValidIp(secondary) 
          ? `@("${primary}","${secondary}")`
          : `@("${primary}")`;
        
        const psCommand = `Set-DnsClientServerAddress -InterfaceAlias "${interfaceName}" -ServerAddresses ${dnsServers}`;
        console.log('Executing PowerShell:', psCommand);
        await this.executePowerShell(psCommand);
        
        // Flush DNS cache
        await this.flushDnsCache();

        // Verify
        const newDns = await this.getActiveDns();
        console.log('DNS after setting:', newDns);
        
        if (newDns.includes(primary)) {
          return { success: true, message: 'DNS servers updated successfully' };
        }
        
        // Even if verification fails, the command might have succeeded
        return { success: true, message: 'DNS command executed successfully' };
      } catch (psError: any) {
        console.error('PowerShell Set-DnsClientServerAddress failed:', psError.message);
        
        // Check if it's a permission issue
        if (psError.message.includes('denied') || 
            psError.message.includes('administrator') ||
            psError.message.includes('elevation')) {
          return { 
            success: false, 
            error: 'Administrator privileges required. Please run the application as Administrator.' 
          };
        }
      }

      // Fallback to netsh
      try {
        console.log('Trying netsh fallback...');
        
        // Set primary DNS
        const cmd1 = `netsh interface ipv4 set dnsservers name="${interfaceName}" static ${primary} primary`;
        console.log('Executing:', cmd1);
        await this.execute(cmd1);

        // Set secondary DNS if provided
        if (secondary && this.isValidIp(secondary)) {
          const cmd2 = `netsh interface ipv4 add dnsservers name="${interfaceName}" ${secondary} index=2`;
          console.log('Executing:', cmd2);
          await this.execute(cmd2);
        }

        // Flush DNS cache
        await this.flushDnsCache();

        return { success: true, message: 'DNS servers updated successfully' };
      } catch (netshError: any) {
        console.error('netsh fallback failed:', netshError.message);
        
        // Check if it's a permission issue
        if (netshError.message.includes('requires elevation') || 
            netshError.message.includes('Access is denied') ||
            netshError.message.includes('administrator')) {
          return { 
            success: false, 
            error: 'Administrator privileges required. Please run the application as Administrator.' 
          };
        }
        
        return { success: false, error: netshError.message };
      }
    } catch (error: any) {
      console.error('setDns error:', error);
      return { success: false, error: error.message || 'Failed to set DNS' };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      let interfaceName: string;
      try {
        interfaceName = await this.getInterfaceName();
      } catch (e: any) {
        return { success: false, error: e.message };
      }

      console.log(`Clearing DNS for interface: "${interfaceName}"`);

      // Try PowerShell method first
      try {
        const psCommand = `Set-DnsClientServerAddress -InterfaceAlias "${interfaceName}" -ResetServerAddresses`;
        console.log('Executing PowerShell:', psCommand);
        await this.executePowerShell(psCommand);
        
        await this.flushDnsCache();
        this.cachedInterfaceName = null;
        
        return { success: true, message: 'DNS reset to DHCP' };
      } catch (psError: any) {
        console.error('PowerShell reset failed:', psError.message);
      }

      // Fallback to netsh
      try {
        const cmd = `netsh interface ipv4 set dnsservers name="${interfaceName}" dhcp`;
        console.log('Executing:', cmd);
        await this.execute(cmd);
        
        await this.flushDnsCache();
        this.cachedInterfaceName = null;
        
        return { success: true, message: 'DNS reset to DHCP' };
      } catch (netshError: any) {
        console.error('netsh reset failed:', netshError.message);
        return { success: false, error: netshError.message };
      }
    } catch (error: any) {
      console.error('clearDns error:', error);
      return { success: false, error: error.message || 'Failed to clear DNS' };
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      // Method 1: PowerShell Get-DnsClientServerAddress
      try {
        const interfaceName = await this.getInterfaceName();
        const { stdout } = await this.executePowerShell(
          `(Get-DnsClientServerAddress -InterfaceAlias "${interfaceName}" -AddressFamily IPv4).ServerAddresses -join ","`
        );
        const servers = stdout.trim().split(',').filter(s => s && this.isValidIp(s));
        if (servers.length > 0) {
          return servers;
        }
      } catch (e) {
        console.log('PowerShell DNS query failed:', e);
      }

      // Method 2: netsh
      try {
        const interfaceName = await this.getInterfaceName();
        const { stdout } = await this.execute(`netsh interface ipv4 show dnsservers name="${interfaceName}"`);
        return this.extractDnsFromNetsh(stdout);
      } catch (e) {
        console.log('netsh DNS query failed:', e);
      }

      return [];
    } catch (error) {
      console.error('getActiveDns error:', error);
      return [];
    }
  }

  /**
   * Extract DNS servers from netsh output
   */
  private extractDnsFromNetsh(output: string): string[] {
    const dnsServers: string[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const ipMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipMatch) {
        const ip = ipMatch[1];
        if (this.isValidDnsIp(ip) && !dnsServers.includes(ip)) {
          dnsServers.push(ip);
        }
      }
    }

    return dnsServers;
  }

  /**
   * Check if DNS is configured statically
   */
  private async isDnsSetStatically(): Promise<boolean> {
    try {
      const interfaceName = await this.getInterfaceName();
      const { stdout } = await this.execute(`netsh interface ipv4 show dnsservers name="${interfaceName}"`);
      
      const lowerOutput = stdout.toLowerCase();
      return lowerOutput.includes('statically') || 
             (lowerOutput.includes('dns') && !lowerOutput.includes('dhcp'));
    } catch {
      return false;
    }
  }

  private isValidIp(ip: string): boolean {
    if (!ip) return false;
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255 && String(num) === part;
    });
  }

  private isValidDnsIp(ip: string): boolean {
    if (!this.isValidIp(ip)) return false;
    if (ip === '0.0.0.0') return false;
    if (ip.startsWith('169.254.')) return false; // Link-local
    if (ip.startsWith('127.')) return false; // Loopback
    return true;
  }

  async getStatus(): Promise<DnsStatus> {
    try {
      const interfaces = await this.getNetworkInterfaces();
      const activeInterface = interfaces.find(i => i.isActive);
      
      if (!activeInterface) {
        return {
          isConnected: false,
          activeDns: [],
          activeInterface: undefined,
        };
      }

      const activeDns = await this.getActiveDns();
      const isStatic = await this.isDnsSetStatically();
      const validDnsServers = activeDns.filter(dns => this.isValidDnsIp(dns));

      // Known DNS providers
      const knownDnsProviders = [
        '8.8.8.8', '8.8.4.4',
        '1.1.1.1', '1.0.0.1',
        '9.9.9.9', '149.112.112.112',
        '208.67.222.222', '208.67.220.220',
        '4.2.2.4', '4.2.2.1', '4.2.2.2', '4.2.2.3',
        '185.228.168.9', '185.228.169.9',
        '94.140.14.14', '94.140.15.15',
        '178.22.122.100', '185.51.200.2',
        '10.202.10.202', '10.202.10.102',
        '78.157.42.100', '78.157.42.101',
        '10.202.10.10', '10.202.10.11',
        '5.202.100.100', '5.202.100.101',
        '185.55.226.26', '185.55.225.25',
        '85.15.1.14', '85.15.1.15',
      ];

      let isConnected = false;
      let matchedServer = '';

      if (isStatic && validDnsServers.length > 0) {
        for (const dns of validDnsServers) {
          if (knownDnsProviders.includes(dns)) {
            isConnected = true;
            matchedServer = dns;
            break;
          }
        }
        
        // Consider connected if static DNS is set (even if not a known provider)
        if (!isConnected) {
          const isGatewayLike = validDnsServers.every(dns => 
            (dns.endsWith('.1') && (dns.startsWith('192.168.') || dns.startsWith('10.')))
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
    } catch (error) {
      console.error('getStatus error:', error);
      return {
        isConnected: false,
        activeDns: [],
      };
    }
  }

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      // Use PowerShell Get-NetAdapter
      const { stdout } = await this.executePowerShell(
        `Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -or $_.Status -eq 'Disconnected' } | Select-Object Name, Status, MediaType | ConvertTo-Json -Compress`
      );
      
      if (!stdout.trim() || stdout.includes('error')) {
        return this.getNetworkInterfacesNetsh();
      }

      const parsed = JSON.parse(stdout);
      const adapters = Array.isArray(parsed) ? parsed : [parsed];
      
      return adapters.map((adapter: any) => ({
        name: adapter.Name,
        displayName: adapter.Name,
        type: this.getInterfaceType(adapter.Name, adapter.MediaType),
        isActive: adapter.Status === 'Up',
      }));
    } catch (error) {
      console.error('getNetworkInterfaces error:', error);
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
    const nameLower = (name || '').toLowerCase();
    const mediaLower = (mediaType || '').toLowerCase();
    
    if (nameLower.includes('wi-fi') || nameLower.includes('wireless') || 
        nameLower.includes('wlan') || mediaLower.includes('wireless')) {
      return 'wifi';
    }
    if (nameLower.includes('ethernet') || nameLower.includes('local area') ||
        mediaLower.includes('ethernet')) {
      return 'ethernet';
    }
    return 'other';
  }

  async flushDnsCache(): Promise<DnsOperationResult> {
    try {
      await this.execute('ipconfig /flushdns');
      return { success: true, message: 'DNS cache flushed successfully' };
    } catch (error: any) {
      console.error('flushDnsCache error:', error);
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
    this.cachedInterfaceName = null;
  }

  private async executePowerShell(command: string): Promise<{ stdout: string; stderr: string }> {
    // Escape double quotes for PowerShell
    const escapedCommand = command.replace(/"/g, '\\"');
    const fullCommand = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${escapedCommand}"`;
    return execAsync(fullCommand, { 
      encoding: 'utf8', 
      timeout: 30000,
      windowsHide: true,
    });
  }

  protected async execute(command: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, { 
      encoding: 'utf8', 
      timeout: 30000,
      windowsHide: true,
    });
  }
}
