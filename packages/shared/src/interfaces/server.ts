/**
 * DNS Server interface
 * Represents a DNS server with its configuration
 */
export interface DnsServer {
  /** Unique identifier for the server */
  key: string;
  /** Display name of the DNS server */
  name: string;
  /** Array of DNS server addresses [primary, secondary?] */
  servers: [string, string?];
  /** URL or path to server avatar/logo */
  avatar?: string;
  /** Server rating (0-5) */
  rating: number;
  /** Categorization tags */
  tags: string[];
  /** Description of the server */
  description?: string;
  /** Whether the server is pinned by user */
  isPinned?: boolean;
  /** Whether this is a custom user-added server */
  isCustom?: boolean;
  /** Country code (ISO 3166-1 alpha-2) */
  country?: string;
  /** Last ping latency in ms */
  latency?: number;
  /** Whether this is the default/recommended server */
  isDefault?: boolean;
}

/**
 * Custom DNS server created by user
 */
export interface CustomDnsServer extends DnsServer {
  isCustom: true;
  /** Creation timestamp */
  createdAt: number;
}

/**
 * DNS server category/tag
 */
export interface DnsCategory {
  key: string;
  name: string;
  nameFA?: string;
  icon?: string;
  description?: string;
}

/**
 * Server database structure
 */
export interface ServersDatabase {
  version: string;
  lastUpdated: string;
  servers: DnsServer[];
  categories: DnsCategory[];
}
