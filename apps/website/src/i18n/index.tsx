import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fa';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.download': 'Download',
    'nav.github': 'GitHub',
    
    // Hero
    'hero.badge': 'Open Source DNS Changer',
    'hero.title': 'Change DNS',
    'hero.titleHighlight': 'Instantly',
    'hero.description': 'Fast, secure, and beautiful DNS management for all platforms. Bypass restrictions and protect your privacy with one click.',
    'hero.downloadNow': 'Download Now',
    'hero.viewOnGithub': 'View on GitHub',
    'hero.securePrivate': 'Secure & Private',
    'hero.dnsServers': '40+ DNS Servers',
    'hero.lightningFast': 'Lightning Fast',
    
    // Features
    'features.title': 'Why',
    'features.titleHighlight': 'Vanilla DNS',
    'features.subtitle': 'Everything you need to manage DNS on any platform',
    'features.oneClick.title': 'One Click Setup',
    'features.oneClick.description': 'Change your DNS with just one click. No complicated settings required.',
    'features.servers.title': '40+ DNS Servers',
    'features.servers.description': 'Pre-configured servers from Google, Cloudflare, Shecan, 403, and more.',
    'features.secure.title': 'Secure & Private',
    'features.secure.description': 'No tracking, no analytics. Your DNS queries stay completely private.',
    'features.darkUi.title': 'Beautiful Dark UI',
    'features.darkUi.description': 'Modern dark theme inspired by Kick.com with smooth animations.',
    'features.crossPlatform.title': 'Cross Platform',
    'features.crossPlatform.description': 'Available on Windows, macOS, Linux with CLI support for automation.',
    'features.autoUpdates.title': 'Auto Updates',
    'features.autoUpdates.description': 'Always stay up to date with automatic updates and new DNS servers.',
    
    // Downloads
    'downloads.title': 'Download',
    'downloads.subtitle': 'Available for all major platforms. Choose your operating system and get started.',
    'downloads.windows': 'Windows',
    'downloads.macos': 'macOS',
    'downloads.linux': 'Linux',
    'downloads.cli': 'CLI',
    'downloads.cliDescription': 'Command Line Interface',
    'downloads.recommended': 'Recommended',
    'downloads.download': 'Download',
    'downloads.viewAllReleases': 'View all releases on GitHub',
    
    // Screenshots
    'screenshots.title': 'Beautiful',
    'screenshots.titleHighlight': 'Dark Theme',
    'screenshots.subtitle': 'Inspired by Kick.com\'s stunning design',
    'screenshots.home.title': 'Home Screen',
    'screenshots.home.description': 'Quick access to change DNS with one click',
    'screenshots.explore.title': 'Explore Servers',
    'screenshots.explore.description': 'Browse through 40+ DNS servers',
    'screenshots.settings.title': 'Settings',
    'screenshots.settings.description': 'Customize your experience',
    
    // Contributors
    'contributors.title': 'Made with',
    'contributors.titleHighlight': '❤️',
    'contributors.subtitle': 'Thanks to all contributors and the open source community',
    'contributors.commits': 'commits',
    'contributors.becomeContributor': 'Become a Contributor',
    
    // Footer
    'footer.title': 'Vanilla DNS',
    'footer.rights': 'All rights reserved.',
    'footer.madeWith': 'Made with',
    'footer.by': 'by',
    'footer.sourceCode': 'Source Code',
    'footer.reportIssue': 'Report Issue',
    'footer.license': 'MIT License',
  },
  fa: {
    // Navbar
    'nav.home': 'خانه',
    'nav.features': 'امکانات',
    'nav.download': 'دانلود',
    'nav.github': 'گیت‌هاب',
    
    // Hero
    'hero.badge': 'تغییر DNS متن‌باز',
    'hero.title': 'تغییر DNS',
    'hero.titleHighlight': 'فوری',
    'hero.description': 'مدیریت DNS سریع، امن و زیبا برای همه پلتفرم‌ها. دور زدن محدودیت‌ها و حفاظت از حریم خصوصی با یک کلیک.',
    'hero.downloadNow': 'دانلود کنید',
    'hero.viewOnGithub': 'مشاهده در گیت‌هاب',
    'hero.securePrivate': 'امن و خصوصی',
    'hero.dnsServers': '+۴۰ سرور DNS',
    'hero.lightningFast': 'فوق‌العاده سریع',
    
    // Features
    'features.title': 'چرا',
    'features.titleHighlight': 'وانیلا DNS',
    'features.subtitle': 'همه آنچه برای مدیریت DNS در هر پلتفرمی نیاز دارید',
    'features.oneClick.title': 'تنظیم با یک کلیک',
    'features.oneClick.description': 'DNS خود را فقط با یک کلیک تغییر دهید. نیازی به تنظیمات پیچیده نیست.',
    'features.servers.title': '+۴۰ سرور DNS',
    'features.servers.description': 'سرورهای از پیش تنظیم شده از Google، Cloudflare، شکن، ۴۰۳ و بیشتر.',
    'features.secure.title': 'امن و خصوصی',
    'features.secure.description': 'بدون ردیابی، بدون آنالیتیکس. کوئری‌های DNS شما کاملاً خصوصی می‌مانند.',
    'features.darkUi.title': 'رابط کاربری تیره زیبا',
    'features.darkUi.description': 'تم تیره مدرن الهام گرفته از Kick.com با انیمیشن‌های نرم.',
    'features.crossPlatform.title': 'چند پلتفرمی',
    'features.crossPlatform.description': 'در دسترس برای ویندوز، مک، لینوکس با پشتیبانی CLI برای اتوماسیون.',
    'features.autoUpdates.title': 'به‌روزرسانی خودکار',
    'features.autoUpdates.description': 'همیشه با به‌روزرسانی‌های خودکار و سرورهای DNS جدید به‌روز بمانید.',
    
    // Downloads
    'downloads.title': 'دانلود',
    'downloads.subtitle': 'برای همه پلتفرم‌های اصلی در دسترس است. سیستم‌عامل خود را انتخاب کنید.',
    'downloads.windows': 'ویندوز',
    'downloads.macos': 'مک',
    'downloads.linux': 'لینوکس',
    'downloads.cli': 'خط فرمان',
    'downloads.cliDescription': 'رابط خط فرمان',
    'downloads.recommended': 'پیشنهادی',
    'downloads.download': 'دانلود',
    'downloads.viewAllReleases': 'مشاهده همه نسخه‌ها در گیت‌هاب',
    
    // Screenshots
    'screenshots.title': 'تم تیره',
    'screenshots.titleHighlight': 'زیبا',
    'screenshots.subtitle': 'الهام گرفته از طراحی خیره‌کننده Kick.com',
    'screenshots.home.title': 'صفحه اصلی',
    'screenshots.home.description': 'دسترسی سریع برای تغییر DNS با یک کلیک',
    'screenshots.explore.title': 'کاوش سرورها',
    'screenshots.explore.description': 'مرور بیش از ۴۰ سرور DNS',
    'screenshots.settings.title': 'تنظیمات',
    'screenshots.settings.description': 'سفارشی‌سازی تجربه شما',
    
    // Contributors
    'contributors.title': 'ساخته شده با',
    'contributors.titleHighlight': '❤️',
    'contributors.subtitle': 'با تشکر از همه مشارکت‌کنندگان و جامعه متن‌باز',
    'contributors.commits': 'کامیت',
    'contributors.becomeContributor': 'مشارکت‌کننده شوید',
    
    // Footer
    'footer.title': 'وانیلا DNS',
    'footer.rights': 'تمامی حقوق محفوظ است.',
    'footer.madeWith': 'ساخته شده با',
    'footer.by': 'توسط',
    'footer.sourceCode': 'کد منبع',
    'footer.reportIssue': 'گزارش مشکل',
    'footer.license': 'مجوز MIT',
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  // Default to English, only change if user explicitly selects Persian
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vanilla-dns-lang');
      if (saved === 'en' || saved === 'fa') return saved;
    }
    return 'en'; // Always default to English
  });

  useEffect(() => {
    localStorage.setItem('vanilla-dns-lang', language);
    document.documentElement.setAttribute('dir', language === 'fa' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const isRTL = language === 'fa';

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
