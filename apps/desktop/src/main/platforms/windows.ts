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
      // Use PowerShell which gives cleaner output
      const { stdout } = await this.executePowerShell(
        `(Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -eq "${this.selectedInterface || 'Wi-Fi'}" }).ServerAddresses -join ","`
      );
      
      const dnsServers = stdout.trim().split(',').filter(s => s && s !== '');
      if (dnsServers.length > 0) {
        return dnsServers;
      }

      // Fallback: get DNS from any active interface
      const { stdout: allDns } = await this.executePowerShell(
        `(Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.ServerAddresses.Count -gt 0 } | Select-Object -First 1).ServerAddresses -join ","`
      );
      
      return allDns.trim().split(',').filter(s => s && s !== '');
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

    return {
      isConnected: activeDns.length > 0 && !activeDns.some(dns => dns === '0.0.0.0' || dns.startsWith('fec0:')),
      activeDns,
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
        name: adapter.Name,
        displayName: adapter.InterfaceDescription || adapter.Name,
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
