import axios from 'axios';

const GITHUB_API = 'https://api.github.com/repos/Vanilla-DNSChanger/vanilla-dns-changer/releases/latest';
const CURRENT_VERSION = '1.0.0';

export interface ReleaseInfo {
  version: string;
  changelog: string;
  downloadUrl: string;
  publishedAt: string;
  isNewer: boolean;
}

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

function getDownloadUrlForPlatform(assets: any[]): string {
  const platform = process.platform;
  const arch = process.arch;
  
  let patterns: string[] = [];
  
  if (platform === 'win32') {
    patterns = ['Setup', '.exe'];
  } else if (platform === 'darwin') {
    patterns = arch === 'arm64' ? ['arm64', '.dmg'] : ['x64', '.dmg'];
  } else if (platform === 'linux') {
    patterns = ['.AppImage', '.deb'];
  }
  
  for (const pattern of patterns) {
    const asset = assets.find((a: any) => a.name.includes(pattern));
    if (asset) {
      return asset.browser_download_url;
    }
  }
  
  return assets[0]?.browser_download_url || '';
}

export async function checkForUpdates(): Promise<ReleaseInfo | null> {
  try {
    const response = await axios.get(GITHUB_API, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vanilla-DNS-Changer'
      },
      timeout: 10000
    });
    
    const release = response.data;
    const latestVersion = release.tag_name.replace(/^v/, '');
    const isNewer = compareVersions(latestVersion, CURRENT_VERSION) > 0;
    
    return {
      version: latestVersion,
      changelog: release.body || 'No changelog available',
      downloadUrl: getDownloadUrlForPlatform(release.assets),
      publishedAt: release.published_at,
      isNewer
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return null;
  }
}

export async function getLatestReleaseAssets(): Promise<ReleaseAsset[]> {
  try {
    const response = await axios.get(GITHUB_API, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vanilla-DNS-Changer'
      },
      timeout: 10000
    });
    
    return response.data.assets.map((asset: any) => ({
      name: asset.name,
      downloadUrl: asset.browser_download_url,
      size: asset.size
    }));
  } catch (error) {
    console.error('Failed to get release assets:', error);
    return [];
  }
}

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}
