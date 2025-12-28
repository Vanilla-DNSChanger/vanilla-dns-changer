/**
 * DNS Validators
 * Validation utilities for DNS-related operations
 */

/**
 * Regular expression for valid IPv4 address
 */
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Check if a string is a valid IPv4 address
 * @param ip - The string to validate
 * @returns true if valid IPv4
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  return IPV4_REGEX.test(ip.trim());
}

/**
 * Check if a string is a valid DNS address (IPv4 only for this project)
 * @param address - The address to validate
 * @returns true if valid DNS address
 */
export function isValidDnsAddress(address: string): boolean {
  return isValidIPv4(address);
}

/**
 * Validate an array of DNS servers
 * @param servers - Array of DNS server addresses
 * @returns Validation result with errors
 */
export function validateDnsServers(servers: string[]): {
  isValid: boolean;
  errors: string[];
  validServers: string[];
} {
  const errors: string[] = [];
  const validServers: string[] = [];

  if (!Array.isArray(servers) || servers.length === 0) {
    return {
      isValid: false,
      errors: ['At least one DNS server is required'],
      validServers: [],
    };
  }

  if (servers.length > 2) {
    errors.push('Maximum of 2 DNS servers allowed');
  }

  servers.slice(0, 2).forEach((server, index) => {
    const trimmed = server.trim();
    if (isValidDnsAddress(trimmed)) {
      validServers.push(trimmed);
    } else {
      errors.push(`Invalid DNS address at position ${index + 1}: ${server}`);
    }
  });

  return {
    isValid: errors.length === 0 && validServers.length > 0,
    errors,
    validServers,
  };
}

/**
 * Parse DNS servers from a comma-separated string
 * @param input - Comma-separated DNS addresses
 * @returns Array of parsed DNS addresses
 */
export function parseDnsInput(input: string): string[] {
  if (!input || typeof input !== 'string') return [];
  
  return input
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Check if a DNS server is a private/local address
 * @param ip - The IP address to check
 * @returns true if private/local
 */
export function isPrivateAddress(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  
  const parts = ip.split('.').map(Number);
  
  // 10.x.x.x
  if (parts[0] === 10) return true;
  
  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 127.x.x.x (localhost)
  if (parts[0] === 127) return true;
  
  return false;
}

/**
 * Format DNS servers for display
 * @param servers - Array of DNS addresses
 * @returns Formatted string
 */
export function formatDnsServers(servers: string[]): string {
  if (!servers || servers.length === 0) return 'None';
  return servers.join(', ');
}
