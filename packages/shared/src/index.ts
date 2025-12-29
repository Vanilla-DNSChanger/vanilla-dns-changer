// Interfaces
export * from './interfaces';

// Validators
export * from './validators';

// Constants
export * from './constants';

// Platforms
export * from './platforms';

// Note: updater.ts is NOT exported here because it uses axios which causes
// Node.js modules (form-data, combined-stream, etc.) to be bundled in browser.
// Import updater separately when needed in Node.js environments:
// import { checkForUpdates, getLatestVersion } from '@vanilla-dns/shared/dist/utils/updater';
