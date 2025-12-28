import { Github, Twitter, Heart } from 'lucide-react';

const GITHUB_URL = 'https://github.com/Vanilla-DNSChanger/vanilla-dns-changer';
const TWITTER_URL = 'https://x.com/sudolite';

export function Footer() {
  return (
    <footer className="py-12 border-t border-vanilla-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            <div>
              <span className="font-bold text-white">Vanilla DNS Changer</span>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-2 text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>by</span>
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-vanilla-green hover:underline"
            >
              @sudolite
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white hover:bg-vanilla-dark-200 rounded-lg transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white hover:bg-vanilla-dark-200 rounded-lg transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 pt-8 border-t border-vanilla-dark-300 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <a href={GITHUB_URL} className="hover:text-vanilla-green transition-colors">
            Source Code
          </a>
          <a href={`${GITHUB_URL}/issues`} className="hover:text-vanilla-green transition-colors">
            Report Issue
          </a>
          <a href={`${GITHUB_URL}/blob/main/LICENSE`} className="hover:text-vanilla-green transition-colors">
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
