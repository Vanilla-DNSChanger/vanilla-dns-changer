import { WindowsPlatform } from './windows';
import { LinuxPlatform } from './linux';
import { MacPlatform } from './mac';
import type { Platform } from '@vanilla-dns/shared';

export { WindowsPlatform } from './windows';
export { LinuxPlatform } from './linux';
export { MacPlatform } from './mac';

let platformInstance: Platform | null = null;

/**
 * Get the platform instance for the current OS
 */
export function getPlatform(): Platform {
  if (platformInstance) {
    return platformInstance;
  }

  switch (process.platform) {
    case 'win32':
      platformInstance = new WindowsPlatform();
      break;
    case 'darwin':
      platformInstance = new MacPlatform();
      break;
    case 'linux':
    default:
      platformInstance = new LinuxPlatform();
      break;
  }

  return platformInstance;
}
