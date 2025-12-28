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
    'hero.title': 'Change DNS',
    'hero.titleHighlight': 'Instantly',
    'hero.subtitle': 'Fast, secure, and beautiful DNS management for all platforms. Bypass restrictions and protect your privacy with one click.',
    'hero.download': 'Download Now',
    'hero.viewGithub': 'View on GitHub',
    'hero.trustedBy': 'Trusted by developers worldwide',
    
    // Features
    'features.title': 'Why',
    'features.titleHighlight': 'Vanilla DNS',
    'features.subtitle': 'Everything you need to manage DNS on any platform',
    'features.speed.title': 'Lightning Fast',
    'features.speed.desc': 'Optimized for speed with instant DNS switching and minimal resource usage.',
    'features.crossPlatform.title': 'Cross Platform',
    'features.crossPlatform.desc': 'Available on Windows, macOS, Linux with CLI support for automation.',
    'features.bypass.title': 'Bypass Restrictions',
    'features.bypass.desc': 'Access blocked content with specialized DNS servers including Vanilla DNS.',
    'features.privacy.title': 'Privacy First',
    'features.privacy.desc': 'No tracking, no analytics. Your DNS queries stay private.',
    'features.adblock.title': 'Ad Blocking',
    'features.adblock.desc': 'Block ads and trackers at DNS level with AdGuard and other providers.',
    'features.servers.title': '40+ DNS Servers',
    'features.servers.desc': 'Pre-configured servers from Google, Cloudflare, Shecan, 403, and more.',
    'features.interface.title': 'Beautiful Interface',
    'features.interface.desc': 'Modern dark theme inspired by Kick.com with smooth animations.',
    'features.openSource.title': 'Open Source',
    'features.openSource.desc': 'Fully open source and free. Contribute on GitHub.',
    
    // Downloads
    'downloads.title': 'Download',
    'downloads.titleHighlight': 'Vanilla DNS',
    'downloads.subtitle': 'Available for all major platforms. Choose your operating system and get started.',
    'downloads.windows': 'Windows',
    'downloads.windowsDesc': 'Windows 10/11 (x64)',
    'downloads.macos': 'macOS',
    'downloads.macosDesc': 'macOS 11+ (Apple Silicon)',
    'downloads.linux': 'Linux',
    'downloads.linuxDesc': 'Ubuntu/Debian (.deb)',
    'downloads.cli': 'CLI',
    'downloads.cliDesc': 'Command Line Interface',
    'downloads.recommended': 'Recommended',
    'downloads.download': 'Download',
    'downloads.allReleases': 'View all releases on GitHub →',
    
    // Screenshots
    'screenshots.title': 'Beautiful',
    'screenshots.titleHighlight': 'Dark Theme',
    'screenshots.subtitle': 'Inspired by Kick.com\'s stunning design',
    
    // Contributors
    'contributors.title': 'Made with',
    'contributors.titleHighlight': '❤️',
    'contributors.subtitle': 'Thanks to all contributors and the open source community',
    
    // Footer
    'footer.description': 'Fast, secure, and beautiful DNS management for all platforms.',
    'footer.product': 'Product',
    'footer.resources': 'Resources',
    'footer.legal': 'Legal',
    'footer.copyright': '© 2025 Vanilla DNS. All rights reserved.',
    'footer.madeWith': 'Made with',
    'footer.by': 'by',
  },
  fa: {
    // Navbar
    'nav.home': 'خانه',
    'nav.features': 'امکانات',
    'nav.download': 'دانلود',
    'nav.github': 'گیت‌هاب',
    
    // Hero
    'hero.title': 'تغییر DNS',
    'hero.titleHighlight': 'فوری',
    'hero.subtitle': 'مدیریت DNS سریع، امن و زیبا برای همه پلتفرم‌ها. دور زدن محدودیت‌ها و حفاظت از حریم خصوصی با یک کلیک.',
    'hero.download': 'دانلود کنید',
    'hero.viewGithub': 'مشاهده در گیت‌هاب',
    'hero.trustedBy': 'مورد اعتماد توسعه‌دهندگان در سراسر جهان',
    
    // Features
    'features.title': 'چرا',
    'features.titleHighlight': 'وانیلا DNS',
    'features.subtitle': 'همه آنچه برای مدیریت DNS در هر پلتفرمی نیاز دارید',
    'features.speed.title': 'فوق‌العاده سریع',
    'features.speed.desc': 'بهینه‌سازی شده برای سرعت با تغییر فوری DNS و مصرف حداقلی منابع.',
    'features.crossPlatform.title': 'چند پلتفرمی',
    'features.crossPlatform.desc': 'در دسترس برای ویندوز، مک، لینوکس با پشتیبانی CLI برای اتوماسیون.',
    'features.bypass.title': 'دور زدن محدودیت',
    'features.bypass.desc': 'دسترسی به محتوای مسدود شده با سرورهای DNS تخصصی از جمله Vanilla DNS.',
    'features.privacy.title': 'حریم خصوصی',
    'features.privacy.desc': 'بدون ردیابی، بدون آنالیتیکس. کوئری‌های DNS شما خصوصی می‌مانند.',
    'features.adblock.title': 'مسدودکننده تبلیغ',
    'features.adblock.desc': 'مسدود کردن تبلیغات و ردیاب‌ها در سطح DNS با AdGuard و دیگر ارائه‌دهندگان.',
    'features.servers.title': '+40 سرور DNS',
    'features.servers.desc': 'سرورهای از پیش تنظیم شده از Google، Cloudflare، شکن، 403 و بیشتر.',
    'features.interface.title': 'رابط کاربری زیبا',
    'features.interface.desc': 'تم تیره مدرن الهام گرفته از Kick.com با انیمیشن‌های نرم.',
    'features.openSource.title': 'متن‌باز',
    'features.openSource.desc': 'کاملاً متن‌باز و رایگان. در گیت‌هاب مشارکت کنید.',
    
    // Downloads
    'downloads.title': 'دانلود',
    'downloads.titleHighlight': 'وانیلا DNS',
    'downloads.subtitle': 'برای همه پلتفرم‌های اصلی در دسترس است. سیستم‌عامل خود را انتخاب کنید.',
    'downloads.windows': 'ویندوز',
    'downloads.windowsDesc': 'ویندوز 10/11 (x64)',
    'downloads.macos': 'مک',
    'downloads.macosDesc': 'macOS 11+ (Apple Silicon)',
    'downloads.linux': 'لینوکس',
    'downloads.linuxDesc': 'اوبونتو/دبیان (.deb)',
    'downloads.cli': 'خط فرمان',
    'downloads.cliDesc': 'رابط خط فرمان',
    'downloads.recommended': 'پیشنهادی',
    'downloads.download': 'دانلود',
    'downloads.allReleases': '← مشاهده همه نسخه‌ها در گیت‌هاب',
    
    // Screenshots
    'screenshots.title': 'تم تیره',
    'screenshots.titleHighlight': 'زیبا',
    'screenshots.subtitle': 'الهام گرفته از طراحی خیره‌کننده Kick.com',
    
    // Contributors
    'contributors.title': 'ساخته شده با',
    'contributors.titleHighlight': '❤️',
    'contributors.subtitle': 'با تشکر از همه مشارکت‌کنندگان و جامعه متن‌باز',
    
    // Footer
    'footer.description': 'مدیریت DNS سریع، امن و زیبا برای همه پلتفرم‌ها.',
    'footer.product': 'محصول',
    'footer.resources': 'منابع',
    'footer.legal': 'قوانین',
    'footer.copyright': '© 2025 Vanilla DNS. تمامی حقوق محفوظ است.',
    'footer.madeWith': 'ساخته شده با',
    'footer.by': 'توسط',
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vanilla-dns-lang');
      if (saved === 'en' || saved === 'fa') return saved;
      // Auto-detect Persian
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('fa') || browserLang.startsWith('per')) return 'fa';
    }
    return 'en';
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
