import { motion } from 'framer-motion';
import { Monitor, Apple, Terminal, Download } from 'lucide-react';

const VERSION = '1.0.1';
const RELEASES_URL = 'https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases';
const DOWNLOAD_BASE = `${RELEASES_URL}/download/v${VERSION}`;

const platforms = [
  {
    icon: Monitor,
    name: 'Windows',
    description: 'Windows 10/11 (x64)',
    downloadUrl: `${DOWNLOAD_BASE}/Vanilla-DNS-Setup-${VERSION}.exe`,
    fileName: 'Vanilla-DNS-Setup-1.0.0.exe',
    badge: 'Recommended',
  },
  {
    icon: Apple,
    name: 'macOS',
    description: 'macOS 11+ (Apple Silicon)',
    downloadUrl: `${DOWNLOAD_BASE}/Vanilla-DNS-Changer-${VERSION}-arm64.dmg`,
    fileName: 'Vanilla-DNS-Changer-1.0.0-arm64.dmg',
  },
  {
    icon: Monitor,
    name: 'Linux',
    description: 'Ubuntu/Debian (.deb)',
    downloadUrl: `${DOWNLOAD_BASE}/Vanilla-DNS-Changer-${VERSION}-amd64.deb`,
    fileName: 'Vanilla-DNS-Changer-1.0.0-amd64.deb',
    altDownload: {
      name: 'AppImage',
      url: `${DOWNLOAD_BASE}/Vanilla-DNS-Changer-${VERSION}-x86_64.AppImage`,
    },
  },
  {
    icon: Terminal,
    name: 'CLI',
    description: 'Command Line Interface',
    command: 'npm install -g @vanilla-dns/cli',
    isCli: true,
  },
];

export function Downloads() {
  return (
    <section id="download" className="py-24 relative">
      <div className="absolute inset-0 bg-radial opacity-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Download <span className="text-gradient">Vanilla DNS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Available for all major platforms. Choose your operating system and get started.
          </p>
        </motion.div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-6 bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl card-hover text-center"
            >
              {platform.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-vanilla-green text-black text-xs font-semibold rounded-full">
                  {platform.badge}
                </div>
              )}
              
              <div className="w-16 h-16 mx-auto bg-vanilla-dark-200 rounded-2xl flex items-center justify-center mb-4">
                <platform.icon className="w-8 h-8 text-vanilla-green" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-1">{platform.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{platform.description}</p>
              
              {platform.isCli ? (
                <div className="bg-vanilla-dark-200 rounded-lg p-3">
                  <code className="text-sm text-vanilla-green">{platform.command}</code>
                </div>
              ) : (
                <div className="space-y-2">
                  <a
                    href={platform.downloadUrl}
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-vanilla-green text-black font-semibold rounded-xl btn-glow"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  {platform.altDownload && (
                    <a
                      href={platform.altDownload.url}
                      className="inline-block w-full px-4 py-2 text-sm text-vanilla-green border border-vanilla-green/30 rounded-lg hover:bg-vanilla-green/10 transition-colors"
                    >
                      {platform.altDownload.name}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* All Releases Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-vanilla-green hover:underline"
          >
            View all releases on GitHub →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
