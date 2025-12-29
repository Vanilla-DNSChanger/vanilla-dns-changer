import type { DnsServer, DnsCategory, ServersDatabase } from '../interfaces';

/**
 * DNS Server Categories
 */
export const DNS_CATEGORIES: DnsCategory[] = [
  {
    key: 'all',
    name: 'All Servers',
    nameFA: 'همه سرورها',
    icon: '🌐',
  },
  {
    key: 'popular',
    name: 'Popular',
    nameFA: 'محبوب',
    icon: '⭐',
  },
  {
    key: 'iran',
    name: 'Iran',
    nameFA: 'ایران',
    icon: '🇮🇷',
  },
  {
    key: 'security',
    name: 'Security',
    nameFA: 'امنیت',
    icon: '🔒',
  },
  {
    key: 'adblock',
    name: 'Ad Blocking',
    nameFA: 'مسدودکننده تبلیغ',
    icon: '🛡️',
  },
  {
    key: 'family',
    name: 'Family Safe',
    nameFA: 'خانواده',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    key: 'gaming',
    name: 'Gaming',
    nameFA: 'گیمینگ',
    icon: '🎮',
  },
  {
    key: 'privacy',
    name: 'Privacy',
    nameFA: 'حریم خصوصی',
    icon: '🕵️',
  },
  {
    key: 'fast',
    name: 'Fast',
    nameFA: 'سریع',
    icon: '⚡',
  },
];

/**
 * Built-in DNS Servers Database
 * This is the base database that ships with the app
 * Additional servers can be synced from GitHub
 */
export const BUILTIN_DNS_SERVERS: DnsServer[] = [
  // Vanilla DNS - Default and recommended (in ALL categories)
  {
    key: 'vanilla',
    name: 'Vanilla DNS',
    servers: ['10.139.177.21', '10.139.177.22'],
    rating: 5,
    tags: ['popular', 'iran', 'fast', 'security', 'privacy', 'adblock', 'gaming'],
    description: 'وانیلا - تحریم‌شکن هوشمند و پرسرعت | Vanilla Bypass DNS - Recommended',
    country: 'IR',
    avatar: 'vanilla',
    isDefault: true,
  },
  // Popular International
  {
    key: 'google',
    name: 'Google DNS',
    servers: ['8.8.8.8', '8.8.4.4'],
    rating: 5,
    tags: ['popular', 'fast', 'security'],
    description: 'Google Public DNS - Fast and reliable',
    country: 'US',
    avatar: 'google',
  },
  {
    key: 'cloudflare',
    name: 'Cloudflare',
    servers: ['1.1.1.1', '1.0.0.1'],
    rating: 5,
    tags: ['popular', 'fast', 'privacy'],
    description: 'Cloudflare DNS - Privacy-focused and fastest',
    country: 'US',
    avatar: 'cloudflare',
  },
  {
    key: 'cloudflare-family',
    name: 'Cloudflare Family',
    servers: ['1.1.1.3', '1.0.0.3'],
    rating: 5,
    tags: ['popular', 'family', 'adblock'],
    description: 'Cloudflare DNS with malware and adult content blocking',
    country: 'US',
    avatar: 'cloudflare',
  },
  {
    key: 'quad9',
    name: 'Quad9',
    servers: ['9.9.9.9', '149.112.112.112'],
    rating: 5,
    tags: ['popular', 'security', 'privacy'],
    description: 'Quad9 - Security and privacy focused',
    country: 'US',
    avatar: 'quad9',
  },
  {
    key: 'opendns',
    name: 'OpenDNS',
    servers: ['208.67.222.222', '208.67.220.220'],
    rating: 4,
    tags: ['popular', 'security'],
    description: 'Cisco OpenDNS - Reliable and customizable',
    country: 'US',
    avatar: 'opendns',
  },
  {
    key: 'opendns-family',
    name: 'OpenDNS FamilyShield',
    servers: ['208.67.222.123', '208.67.220.123'],
    rating: 4,
    tags: ['family', 'security'],
    description: 'OpenDNS with pre-configured family protection',
    country: 'US',
    avatar: 'opendns',
  },
  {
    key: 'adguard',
    name: 'AdGuard DNS',
    servers: ['94.140.14.14', '94.140.15.15'],
    rating: 5,
    tags: ['popular', 'adblock', 'privacy'],
    description: 'AdGuard DNS - Blocks ads and trackers',
    country: 'CY',
    avatar: 'adguard',
  },
  {
    key: 'adguard-family',
    name: 'AdGuard Family',
    servers: ['94.140.14.15', '94.140.15.16'],
    rating: 5,
    tags: ['family', 'adblock'],
    description: 'AdGuard DNS with family protection',
    country: 'CY',
    avatar: 'adguard',
  },
  {
    key: 'comodo',
    name: 'Comodo Secure',
    servers: ['8.26.56.26', '8.20.247.20'],
    rating: 4,
    tags: ['security'],
    description: 'Comodo Secure DNS',
    country: 'US',
    avatar: 'comodo',
  },
  {
    key: 'cleanbrowsing-adult',
    name: 'CleanBrowsing Adult',
    servers: ['185.228.168.10', '185.228.169.11'],
    rating: 4,
    tags: ['family', 'security'],
    description: 'CleanBrowsing - Adult content filter',
    country: 'US',
    avatar: 'cleanbrowsing',
  },
  {
    key: 'cleanbrowsing-family',
    name: 'CleanBrowsing Family',
    servers: ['185.228.168.168', '185.228.169.168'],
    rating: 4,
    tags: ['family'],
    description: 'CleanBrowsing - Family filter (strictest)',
    country: 'US',
    avatar: 'cleanbrowsing',
  },
  {
    key: 'cleanbrowsing-security',
    name: 'CleanBrowsing Security',
    servers: ['185.228.168.9', '185.228.169.9'],
    rating: 4,
    tags: ['security'],
    description: 'CleanBrowsing - Security filter',
    country: 'US',
    avatar: 'cleanbrowsing',
  },
  {
    key: 'nextdns',
    name: 'NextDNS',
    servers: ['45.90.28.167', '45.90.30.167'],
    rating: 5,
    tags: ['popular', 'privacy', 'adblock'],
    description: 'NextDNS - Modern DNS with analytics',
    country: 'US',
    avatar: 'nextdns',
  },
  {
    key: 'controld',
    name: 'Control D',
    servers: ['76.76.2.0', '76.76.10.0'],
    rating: 4,
    tags: ['privacy', 'adblock'],
    description: 'Control D - Customizable DNS',
    country: 'CA',
    avatar: 'controld',
  },
  {
    key: 'mullvad',
    name: 'Mullvad DNS',
    servers: ['194.242.2.2', '193.19.108.2'],
    rating: 4,
    tags: ['privacy'],
    description: 'Mullvad DNS - No logging',
    country: 'SE',
    avatar: 'mullvad',
  },
  {
    key: 'dns0',
    name: 'dns0.eu',
    servers: ['193.110.81.0', '185.253.5.0'],
    rating: 4,
    tags: ['privacy', 'security'],
    description: 'European DNS - GDPR compliant',
    country: 'EU',
    avatar: 'dns0',
  },

  // Iranian DNS Servers
  {
    key: 'shecan',
    name: 'Shecan',
    servers: ['178.22.122.100', '185.51.200.2'],
    rating: 5,
    tags: ['iran', 'popular'],
    description: 'شکن - سرویس DNS ایرانی',
    country: 'IR',
    avatar: 'shecan',
  },
  {
    key: '403',
    name: '403.online',
    servers: ['10.202.10.202', '10.202.10.102'],
    rating: 4,
    tags: ['iran', 'popular'],
    description: '403 - DNS رایگان ایرانی',
    country: 'IR',
    avatar: '403',
  },
  {
    key: 'electro',
    name: 'Electro Team',
    servers: ['78.157.42.100', '78.157.42.101'],
    rating: 4,
    tags: ['iran'],
    description: 'الکترو تیم - DNS ایرانی',
    country: 'IR',
    avatar: 'electro',
  },
  {
    key: 'begzar',
    name: 'Begzar',
    servers: ['185.55.226.26', '185.55.225.25'],
    rating: 4,
    tags: ['iran'],
    description: 'بگذر - سرویس DNS',
    country: 'IR',
    avatar: 'begzar',
  },
  {
    key: 'radar',
    name: 'Radar Game',
    servers: ['10.202.10.10', '10.202.10.11'],
    rating: 4,
    tags: ['iran', 'gaming'],
    description: 'رادار گیم - مخصوص بازی',
    country: 'IR',
    avatar: 'radar',
  },
  {
    key: 'hostiran',
    name: 'Host Iran',
    servers: ['172.29.0.100', '172.29.2.100'],
    rating: 3,
    tags: ['iran'],
    description: 'هاست ایران DNS',
    country: 'IR',
    avatar: 'hostiran',
  },
  {
    key: 'asiatech',
    name: 'AsiaTech',
    servers: ['194.36.174.161', '178.22.122.100'],
    rating: 3,
    tags: ['iran'],
    description: 'آسیاتک DNS',
    country: 'IR',
    avatar: 'asiatech',
  },
  {
    key: 'pishgaman',
    name: 'Pishgaman',
    servers: ['5.202.100.100', '5.202.100.101'],
    rating: 3,
    tags: ['iran'],
    description: 'پیشگامان DNS',
    country: 'IR',
    avatar: 'pishgaman',
  },

  // Gaming & Performance
  {
    key: 'level3',
    name: 'Level3',
    servers: ['209.244.0.3', '209.244.0.4'],
    rating: 3,
    tags: ['fast'],
    description: 'Level3 DNS',
    country: 'US',
    avatar: 'level3',
  },
  {
    key: 'verisign',
    name: 'Verisign',
    servers: ['64.6.64.6', '64.6.65.6'],
    rating: 3,
    tags: ['security'],
    description: 'Verisign Public DNS',
    country: 'US',
    avatar: 'verisign',
  },
  {
    key: 'neustar',
    name: 'Neustar UltraDNS',
    servers: ['64.6.64.6', '156.154.70.1'],
    rating: 3,
    tags: ['fast', 'security'],
    description: 'Neustar UltraDNS Public',
    country: 'US',
    avatar: 'neustar',
  },
  {
    key: 'yandex',
    name: 'Yandex DNS',
    servers: ['77.88.8.8', '77.88.8.1'],
    rating: 3,
    tags: ['fast'],
    description: 'Yandex DNS Basic',
    country: 'RU',
    avatar: 'yandex',
  },
  {
    key: 'yandex-safe',
    name: 'Yandex Safe',
    servers: ['77.88.8.88', '77.88.8.2'],
    rating: 3,
    tags: ['security'],
    description: 'Yandex DNS - Virus protection',
    country: 'RU',
    avatar: 'yandex',
  },
  {
    key: 'yandex-family',
    name: 'Yandex Family',
    servers: ['77.88.8.7', '77.88.8.3'],
    rating: 3,
    tags: ['family'],
    description: 'Yandex DNS - Family mode',
    country: 'RU',
    avatar: 'yandex',
  },

  // Additional International
  {
    key: 'alternate',
    name: 'Alternate DNS',
    servers: ['76.76.19.19', '76.223.122.150'],
    rating: 3,
    tags: ['adblock'],
    description: 'Alternate DNS - Ad blocking',
    country: 'US',
    avatar: 'alternate',
  },
  {
    key: 'freenom',
    name: 'Freenom World',
    servers: ['80.80.80.80', '80.80.81.81'],
    rating: 2,
    tags: ['fast'],
    description: 'Freenom World DNS',
    country: 'NL',
    avatar: 'freenom',
  },
  {
    key: 'dyn',
    name: 'Dyn',
    servers: ['216.146.35.35', '216.146.36.36'],
    rating: 3,
    tags: ['fast'],
    description: 'Dyn DNS (Oracle)',
    country: 'US',
    avatar: 'dyn',
  },
  {
    key: 'safedns',
    name: 'SafeDNS',
    servers: ['195.46.39.39', '195.46.39.40'],
    rating: 3,
    tags: ['family', 'security'],
    description: 'SafeDNS Family filter',
    country: 'US',
    avatar: 'safedns',
  },
  {
    key: 'uncensored',
    name: 'UncensoredDNS',
    servers: ['91.239.100.100', '89.233.43.71'],
    rating: 3,
    tags: ['privacy'],
    description: 'UncensoredDNS - Danish DNS',
    country: 'DK',
    avatar: 'uncensored',
  },
  {
    key: 'fourth-estate',
    name: 'Fourth Estate',
    servers: ['45.77.165.194'],
    rating: 2,
    tags: ['privacy'],
    description: 'Fourth Estate DNS',
    country: 'US',
    avatar: 'default',
  },
  {
    key: 'cira',
    name: 'CIRA Shield',
    servers: ['149.112.121.10', '149.112.122.10'],
    rating: 3,
    tags: ['security', 'privacy'],
    description: 'Canadian Shield DNS',
    country: 'CA',
    avatar: 'cira',
  },
  {
    key: 'switch',
    name: 'SWITCH DNS',
    servers: ['130.59.31.248', '130.59.31.251'],
    rating: 3,
    tags: ['privacy'],
    description: 'Swiss Education & Research Network',
    country: 'CH',
    avatar: 'switch',
  },
];

/**
 * Get the complete servers database
 */
export function getServersDatabase(): ServersDatabase {
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    servers: BUILTIN_DNS_SERVERS,
    categories: DNS_CATEGORIES,
  };
}

/**
 * Find a server by key
 */
export function findServerByKey(key: string): DnsServer | undefined {
  return BUILTIN_DNS_SERVERS.find(s => s.key === key);
}

/**
 * Find a server by name (case insensitive)
 */
export function findServerByName(name: string): DnsServer | undefined {
  const lower = name.toLowerCase();
  return BUILTIN_DNS_SERVERS.find(s => s.name.toLowerCase().includes(lower));
}

/**
 * Get servers by tag
 */
export function getServersByTag(tag: string): DnsServer[] {
  return BUILTIN_DNS_SERVERS.filter(s => s.tags.includes(tag));
}

/**
 * Get popular servers
 */
export function getPopularServers(): DnsServer[] {
  return getServersByTag('popular');
}

/**
 * Get Iranian servers
 */
export function getIranianServers(): DnsServer[] {
  return getServersByTag('iran');
}
