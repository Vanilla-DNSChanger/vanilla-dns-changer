/**
 * Centralized version management for all Vanilla DNS packages
 * Update this file to change version across all apps
 */
export const VERSION = '1.0.0';

export const VERSION_INFO = {
  version: VERSION,
  releaseDate: '2025-01-01',
  releaseNotes: 'https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases',
};

/**
 * Get download URL for a specific asset
 */
export function getDownloadUrl(filename: string): string {
  return `https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases/download/v${VERSION}/${filename}`;
}

/**
 * Asset filenames for each platform
 */
export const RELEASE_ASSETS = {
  windows: `Vanilla-DNS-Setup-${VERSION}.exe`,
  macos: `Vanilla-DNS-Changer-${VERSION}-arm64.dmg`,
  macosIntel: `Vanilla-DNS-Changer-${VERSION}-x64.dmg`,
  linuxDeb: `Vanilla-DNS-Changer-${VERSION}-amd64.deb`,
  linuxAppImage: `Vanilla-DNS-Changer-${VERSION}-x86_64.AppImage`,
};
