import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import network from 'network';
import {
  Platform,
  DnsStatus,
  DnsOperationResult,
  NetworkInterface,
  PingResult,
} from '@vanilla-dns/shared';

const execAsync = promisify(exec);

/**
 * Network interface from the 'network' package
 */
interface NetworkPackageInterface {
  name: string;
  mac_address: string | undefined;
  ip_address: string | undefined;
  vendor: string;
  model: string;
  type: string;
  netmask: string | null;
  gateway_ip: string | null;
}

/**
 * Windows Platform implementation
 * Uses the 'network' package for reliable adapter detection
 * and netsh/PowerShell for DNS operations
 */
export class WindowsPlatform extends Platform {
  readonly type = 'windows' as const;
  private selectedInterface: string | null = null;
  private cachedActiveInterface: NetworkPackageInterface | null = null;
  private lastInterfaceCheck: number = 0;
  private static INTERFACE_CACHE_TTL = 10000; // 10 seconds

  /**
   * Get the active network interface with gateway
   * This is the most reliable way to detect the primary network adapter
   */
  private async getValidateInterface(): Promise<NetworkPackageInterface> {
    // Use cached value if still valid
    const now = Date.now();
    if (this.cachedActiveInterface && (now - this.lastInterfaceCheck) < WindowsPlatform.INTERFACE_CACHE_TTL) {
      return this.cachedActiveInterface;
    }

    return new Promise((resolve, reject) => {
      network.get_interfaces_list((err: Error | null, interfaces: NetworkPackageInterface[]) => {
        if (err) {
          reject(new Error('Failed to get network interfaces: ' + err.message));
          return;
        }

        // Find the interface with an active gateway (this is the primary internet connection)
        const activeInterface = interfaces.find(
          (iface: NetworkPackageInterface) => iface.gateway_ip != null && iface.gateway_ip !== ''
        );

        if (!activeInterface) {
          reject(new Error('No active network connection found. Please check your internet connection.'));
          return;
        }

        this.cachedActiveInterface = activeInterface;
        this.lastInterfaceCheck = now;
        resolve(activeInterface);
      });
    });
  }

  /**
   * Get the interface name to use for DNS operations
   */
  private async getInterfaceName(): Promise<string> {
    if (this.selectedInterface && this.selectedInterface !== 'Auto') {
      return this.selectedInterface;
    }

    const activeInterface = await this.getValidateInterface();
    return activeInterface.name;
  }

  async setDns(servers: string[]): Promise<DnsOperationResult> {
    try {
      const interfaceName = await this.getInterfaceName();
      const [primary, secondary] = servers;

      console.log(`Setting DNS for interface: ${interfaceName}`);
      console.log(`Primary DNS: ${primary}, Secondary DNS: ${secondary || 'none'}`);

      // Validate servers
      if (!primary || !primary.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return { success: false, error: 'Invalid primary DNS server address' };
      }

      // Use netsh for setting DNS - more reliable with admin privileges
      const cmdServer1 = `netsh interface ip set dns name="${interfaceName}" static ${primary} validate=no`;
      console.log(`Executing: ${cmdServer1}`);
      await this.executeNetsh(cmdServer1);

      if (secondary && secondary.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        const cmdServer2 = `netsh interface ip add dns name="${interfaceName}" ${secondary} index=2 validate=no`;
        console.log(`Executing: ${cmdServer2}`);
        await this.executeNetsh(cmdServer2);
      }

      // Flush DNS cache after setting
      await this.flushDnsCache();

      // Verify the DNS was set correctly
      const newDns = await this.getActiveDns();
      if (newDns.includes(primary)) {
        return { success: true, message: 'DNS servers updated successfully' };
      } else {
        console.warn('DNS verification failed. Current DNS:', newDns);
        return { success: true, message: 'DNS command executed. Please verify the connection.' };
      }
    } catch (error: any) {
      console.error('setDns error:', error);
      const errorMessage = error.message || 'Failed to set DNS';
      
      // Provide more helpful error messages
      if (errorMessage.includes('access') || errorMessage.includes('denied') || errorMessage.includes('Administrator')) {
        return { success: false, error: 'Administrator privileges required. Please run the application as Administrator.' };
      }
      if (errorMessage.includes('not found') || errorMessage.includes('interface')) {
        return { success: false, error: `Network interface "${await this.getInterfaceName().catch(() => 'unknown')}" not found. Please check your network connection.` };
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async clearDns(): Promise<DnsOperationResult> {
    try {
      const interfaceName = await this.getInterfaceName();

      console.log(`Clearing DNS for interface: ${interfaceName}`);

      // Reset to DHCP
      const cmd = `netsh interface ip set dns name="${interfaceName}" dhcp`;
      console.log(`Executing: ${cmd}`);
      await this.executeNetsh(cmd);

      // Flush DNS cache
      await this.flushDnsCache();

      // Clear the cached interface since network state might change
      this.cachedActiveInterface = null;

      return { success: true, message: 'DNS reset to DHCP' };
    } catch (error: any) {
      console.error('clearDns error:', error);
      return { success: false, error: error.message || 'Failed to clear DNS' };
    }
  }

  async getActiveDns(): Promise<string[]> {
    try {
      const interfaceName = await this.getInterfaceName();
      const cmd = `netsh interface ip show dns "${interfaceName}"`;
      
      const { stdout } = await this.execute(cmd);
      return this.extractDns(stdout);
    } catch (error) {
      console.error('getActiveDns error:', error);
      return [];
    }
  }

  /**
   * Extract DNS servers from netsh output
   * Handles both static and DHCP configurations
   */
  private extractDns(output: string): string[] {
    const dnsServers: string[] = [];
    const lines = output.split('\n');
    
    let foundStaticSection = false;
    let foundDhcpSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is the static DNS section
      if (trimmedLine.toLowerCase().includes('statically configured')) {
        foundStaticSection = true;
        foundDhcpSection = false;
      }
      
      // Check if this is DHCP section
      if (trimmedLine.toLowerCase().includes('configured through dhcp')) {
        foundDhcpSection = true;
        foundStaticSection = false;
      }

      // Extract IP addresses from the line
      const ipMatch = trimmedLine.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipMatch) {
        const ip = ipMatch[1];
        // Validate it's a real IP and not already in the list
        if (this.isValidDnsIp(ip) && !dnsServers.includes(ip)) {
          dnsServers.push(ip);
        }
      }
    }

    return dnsServers;
  }

  /**
   * Check if DNS is configured statically (not via DHCP)
   */
  private async isDnsSetStatically(interfaceName: string): Promise<boolean> {
    try {
      const cmd = `netsh interface ip show dns "${interfaceName}"`;
      const { stdout } = await this.execute(cmd);
      
      const lowerOutput = stdout.toLowerCase();
      
      // Check for static configuration indicators
      if (lowerOutput.includes('statically configured')) {
        return true;
      }
      
      // Check for DHCP configuration
      if (lowerOutput.includes('configured through dhcp') || 
          lowerOutput.includes('dhcp:') ||
          lowerOutput.includes('dhcp enabled')) {
        return false;
      }

      // If there are DNS servers listed but no DHCP mention, likely static
      const hasIpAddresses = /\d+\.\d+\.\d+\.\d+/.test(stdout);
      return hasIpAddresses && !lowerOutput.includes('dhcp');
    } catch (error) {
      console.error('isDnsSetStatically error:', error);
      return false;
    }
  }

  /**
   * Validate if an IP is a valid DNS server address
   */
  private isValidDnsIp(ip: string): boolean {
    if (!ip || ip === '0.0.0.0') return false;
    if (ip.startsWith('169.254.')) return false; // Link-local
    if (ip.startsWith('127.')) return false; // Loopback
    if (ip.startsWith('fe80:') || ip.startsWith('fec0:')) return false; // IPv6 link-local
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

      // Get current DNS servers
      const activeDns = await this.getActiveDns();
      
      // Check if DNS is set statically
      const interfaceName = await this.getInterfaceName();
      const isStatic = await this.isDnsSetStatically(interfaceName);
      
      // Filter valid DNS servers
      const validDnsServers = activeDns.filter(dns => this.isValidDnsIp(dns));

      // Known DNS providers for matching
      const knownDnsProviders = [
        // Global
        '8.8.8.8', '8.8.4.4', // Google
        '1.1.1.1', '1.0.0.1', // Cloudflare
        '9.9.9.9', '149.112.112.112', // Quad9
        '208.67.222.222', '208.67.220.220', // OpenDNS
        '4.2.2.4', '4.2.2.1', '4.2.2.2', '4.2.2.3', // Level3
        '185.228.168.9', '185.228.169.9', // CleanBrowsing
        '94.140.14.14', '94.140.15.15', // AdGuard
        // Iran specific
        '178.22.122.100', '185.51.200.2', // Shecan
        '10.202.10.202', '10.202.10.102', // 403
        '78.157.42.100', '78.157.42.101', // Electro
        '10.202.10.10', '10.202.10.11', // Radar
        '5.202.100.100', '5.202.100.101', // Pishgaman
        '185.55.226.26', '185.55.225.25', // Begzar
        '85.15.1.14', '85.15.1.15', // Shatel
      ];

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
          // Only consider NOT connected if DNS looks like a gateway/router
          const isGatewayLike = validDnsServers.every(dns => 
            (dns.endsWith('.1') && dns.startsWith('192.168.')) ||
            (dns.startsWith('10.') && dns.endsWith('.1'))
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
      // Use the 'network' package for reliable interface detection
      return new Promise((resolve, reject) => {
        network.get_interfaces_list((err: Error | null, interfaces: NetworkPackageInterface[]) => {
          if (err) {
            console.error('get_interfaces_list error:', err);
            // Fallback to PowerShell method
            this.getNetworkInterfacesPowerShell().then(resolve).catch(reject);
            return;
          }

          const result: NetworkInterface[] = interfaces.map((iface: NetworkPackageInterface) => ({
            name: iface.name,
            displayName: iface.name,
            type: this.getInterfaceType(iface.name, iface.type),
            isActive: iface.gateway_ip != null && iface.gateway_ip !== '',
            ip: iface.ip_address || undefined,
            mac: iface.mac_address || undefined,
          }));

          // Sort so active interfaces come first
          result.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));

          resolve(result);
        });
      });
    } catch (error) {
      console.error('getNetworkInterfaces error:', error);
      return this.getNetworkInterfacesPowerShell();
    }
  }

  /**
   * Fallback method using PowerShell for interface detection
   */
  private async getNetworkInterfacesPowerShell(): Promise<NetworkInterface[]> {
    try {
      const { stdout } = await this.executePowerShell(
        `Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -or $_.Status -eq 'Disconnected' } | Select-Object Name, InterfaceDescription, Status, MediaType | ConvertTo-Json`
      );
      
      if (!stdout.trim()) {
        return [];
      }

      const adapters = JSON.parse(stdout);
      const adapterArray = Array.isArray(adapters) ? adapters : [adapters];
      
      return adapterArray.map((adapter: any) => ({
        name: adapter.Name,
        displayName: adapter.Name,
        type: this.getInterfaceType(adapter.Name, adapter.MediaType),
        isActive: adapter.Status === 'Up',
      }));
    } catch (error) {
      console.error('getNetworkInterfacesPowerShell error:', error);
      return this.getNetworkInterfacesNetsh();
    }
  }

  /**
   * Fallback method using netsh for interface detection
   */
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

  /**
   * Check if WMIC is available (some Windows versions don't have it)
   */
  async isWmicAvailable(): Promise<boolean> {
    try {
      await this.execute('wmic os get caption');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set the network interface to use for DNS operations
   */
  setInterface(interfaceName: string) {
    this.selectedInterface = interfaceName;
    // Clear cache when interface changes
    this.cachedActiveInterface = null;
  }

  /**
   * Execute a netsh command
   * On Windows, the app runs with admin privileges (requestedExecutionLevel in package.json)
   * So we can execute commands directly
   */
  private async executeNetsh(command: string): Promise<{ stdout: string; stderr: string }> {
    try {
      // First try direct execution (works when app is run as admin)
      return await execAsync(command, { encoding: 'utf8', timeout: 30000 });
    } catch (error: any) {
      console.error('Direct netsh execution failed:', error.message);
      
      // Fallback: try using PowerShell with elevated context
      try {
        const psCommand = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "& {${command.replace(/"/g, '\\"')}}"`;
        return await execAsync(psCommand, { encoding: 'utf8', timeout: 30000 });
      } catch (psError: any) {
        console.error('PowerShell netsh execution failed:', psError.message);
        throw new Error(`Failed to execute command. Please run the application as Administrator. Original error: ${error.message}`);
      }
    }
  }

  private async executePowerShell(command: string): Promise<{ stdout: string; stderr: string }> {
    const psCommand = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${command.replace(/"/g, '\\"')}"`;
    return execAsync(psCommand, { encoding: 'utf8', timeout: 30000 });
  }

  protected async execute(command: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, { encoding: 'utf8', timeout: 30000 });
  }
}
