import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Github, Globe } from 'lucide-react';
import { useI18n } from '../i18n';

const GITHUB_URL = 'https://github.com/Vanilla-DNSChanger/vanilla-dns-changer';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.features'), href: '#features' },
    { label: t('nav.download'), href: '#download' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-vanilla-dark-100/90 backdrop-blur-lg border-b border-vanilla-dark-300'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <a href="#" className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg text-white">{isRTL ? 'وانیلا DNS' : 'Vanilla DNS'}</span>
          </a>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-vanilla-green transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side Buttons */}
          <div className={`hidden md:flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-vanilla-dark-200 hover:bg-vanilla-dark-300 rounded-lg transition-colors"
              title={language === 'en' ? 'فارسی' : 'English'}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{language === 'en' ? 'FA' : 'EN'}</span>
            </button>
            
            {/* GitHub Button */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-vanilla-dark-200 hover:bg-vanilla-dark-300 rounded-lg transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>{t('nav.github')}</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-vanilla-dark-300"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 text-gray-300 hover:text-vanilla-green transition-colors ${isRTL ? 'text-right' : ''}`}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-2 py-3 text-gray-300 hover:text-vanilla-green w-full ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'en' ? 'فارسی' : 'English'}</span>
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 py-3 text-gray-300 hover:text-vanilla-green ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
