export type Language = 'en' | 'fa';

export interface Translations {
  app: {
    name: string;
    tagline: string;
  };
  nav: {
    home: string;
    servers: string;
    settings: string;
    about: string;
  };
  home: {
    welcome: string;
    status: string;
    connected: string;
    disconnected: string;
    connect: string;
    disconnect: string;
    currentDns: string;
    noDns: string;
    selectServer: string;
    quickConnect: string;
    recommendedServer: string;
  };
  servers: {
    title: string;
    search: string;
    categories: string;
    all: string;
    popular: string;
    iran: string;
    security: string;
    adblock: string;
    family: string;
    gaming: string;
    privacy: string;
    fast: string;
    custom: string;
    addCustom: string;
    pinned: string;
    noPinned: string;
    noServers: string;
    connect: string;
    ping: string;
    pin: string;
    unpin: string;
    delete: string;
    serverName: string;
    primaryDns: string;
    secondaryDns: string;
    add: string;
    cancel: string;
  };
  settings: {
    title: string;
    general: string;
    appearance: string;
    network: string;
    about: string;
    language: string;
    languageDesc: string;
    theme: string;
    themeDesc: string;
    dark: string;
    light: string;
    system: string;
    startMinimized: string;
    startMinimizedDesc: string;
    minimizeToTray: string;
    minimizeToTrayDesc: string;
    autoStart: string;
    autoStartDesc: string;
    notifications: string;
    notificationsDesc: string;
    autoSync: string;
    autoSyncDesc: string;
    flushDns: string;
    flushDnsDesc: string;
    flushNow: string;
    networkInterface: string;
    networkInterfaceDesc: string;
    version: string;
    checkUpdates: string;
    github: string;
    website: string;
    reportBug: string;
  };
  status: {
    connecting: string;
    connected: string;
    disconnecting: string;
    disconnected: string;
    error: string;
    flushing: string;
    flushed: string;
  };
  errors: {
    connectionFailed: string;
    disconnectionFailed: string;
    flushFailed: string;
    adminRequired: string;
    networkError: string;
    unknownError: string;
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    yes: string;
    no: string;
    ok: string;
    retry: string;
    refresh: string;
    copy: string;
    copied: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    app: {
      name: 'Vanilla DNS Changer',
      tagline: 'Fast, Secure DNS Management',
    },
    nav: {
      home: 'Home',
      servers: 'Servers',
      settings: 'Settings',
      about: 'About',
    },
    home: {
      welcome: 'Welcome to Vanilla DNS',
      status: 'Status',
      connected: 'Connected',
      disconnected: 'Disconnected',
      connect: 'Connect',
      disconnect: 'Disconnect',
      currentDns: 'Current DNS',
      noDns: 'No DNS configured',
      selectServer: 'Select a server to connect',
      quickConnect: 'Quick Connect',
      recommendedServer: 'Recommended',
    },
    servers: {
      title: 'DNS Servers',
      search: 'Search servers...',
      categories: 'Categories',
      all: 'All Servers',
      popular: 'Popular',
      iran: 'Iran',
      security: 'Security',
      adblock: 'Ad Blocking',
      family: 'Family Safe',
      gaming: 'Gaming',
      privacy: 'Privacy',
      fast: 'Fast',
      custom: 'Custom',
      addCustom: 'Add Custom Server',
      pinned: 'Pinned Servers',
      noPinned: 'No pinned servers',
      noServers: 'No servers found',
      connect: 'Connect',
      ping: 'Ping',
      pin: 'Pin',
      unpin: 'Unpin',
      delete: 'Delete',
      serverName: 'Server Name',
      primaryDns: 'Primary DNS',
      secondaryDns: 'Secondary DNS (optional)',
      add: 'Add Server',
      cancel: 'Cancel',
    },
    settings: {
      title: 'Settings',
      general: 'General',
      appearance: 'Appearance',
      network: 'Network',
      about: 'About',
      language: 'Language',
      languageDesc: 'Select your preferred language',
      theme: 'Theme',
      themeDesc: 'Choose your preferred theme',
      dark: 'Dark',
      light: 'Light',
      system: 'System',
      startMinimized: 'Start Minimized',
      startMinimizedDesc: 'Start the app minimized to system tray',
      minimizeToTray: 'Minimize to Tray',
      minimizeToTrayDesc: 'Minimize to system tray instead of closing',
      autoStart: 'Auto Start',
      autoStartDesc: 'Start app when system boots',
      notifications: 'Notifications',
      notificationsDesc: 'Show desktop notifications',
      autoSync: 'Auto Sync Servers',
      autoSyncDesc: 'Automatically sync server list from GitHub',
      flushDns: 'Flush DNS Cache',
      flushDnsDesc: 'Clear the DNS cache to apply changes immediately',
      flushNow: 'Flush Now',
      networkInterface: 'Network Interface',
      networkInterfaceDesc: 'Select the network interface to configure',
      version: 'Version',
      checkUpdates: 'Check for Updates',
      github: 'GitHub Repository',
      website: 'Website',
      reportBug: 'Report a Bug',
    },
    status: {
      connecting: 'Connecting...',
      connected: 'Connected successfully',
      disconnecting: 'Disconnecting...',
      disconnected: 'Disconnected',
      error: 'Error occurred',
      flushing: 'Flushing DNS cache...',
      flushed: 'DNS cache flushed',
    },
    errors: {
      connectionFailed: 'Failed to connect to DNS server',
      disconnectionFailed: 'Failed to disconnect from DNS server',
      flushFailed: 'Failed to flush DNS cache',
      adminRequired: 'Administrator privileges required',
      networkError: 'Network error occurred',
      unknownError: 'An unknown error occurred',
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      retry: 'Retry',
      refresh: 'Refresh',
      copy: 'Copy',
      copied: 'Copied!',
    },
  },
  fa: {
    app: {
      name: 'وانیلا DNS',
      tagline: 'مدیریت DNS سریع و امن',
    },
    nav: {
      home: 'خانه',
      servers: 'سرورها',
      settings: 'تنظیمات',
      about: 'درباره',
    },
    home: {
      welcome: 'به وانیلا DNS خوش آمدید',
      status: 'وضعیت',
      connected: 'متصل',
      disconnected: 'قطع',
      connect: 'اتصال',
      disconnect: 'قطع اتصال',
      currentDns: 'DNS فعلی',
      noDns: 'DNS تنظیم نشده',
      selectServer: 'یک سرور برای اتصال انتخاب کنید',
      quickConnect: 'اتصال سریع',
      recommendedServer: 'پیشنهادی',
    },
    servers: {
      title: 'سرورهای DNS',
      search: 'جستجوی سرور...',
      categories: 'دسته‌بندی‌ها',
      all: 'همه سرورها',
      popular: 'محبوب',
      iran: 'ایران',
      security: 'امنیت',
      adblock: 'مسدودکننده تبلیغ',
      family: 'خانواده',
      gaming: 'گیمینگ',
      privacy: 'حریم خصوصی',
      fast: 'سریع',
      custom: 'سفارشی',
      addCustom: 'افزودن سرور سفارشی',
      pinned: 'سرورهای پین شده',
      noPinned: 'سرور پین شده‌ای وجود ندارد',
      noServers: 'سروری یافت نشد',
      connect: 'اتصال',
      ping: 'پینگ',
      pin: 'پین کردن',
      unpin: 'برداشتن پین',
      delete: 'حذف',
      serverName: 'نام سرور',
      primaryDns: 'DNS اصلی',
      secondaryDns: 'DNS ثانویه (اختیاری)',
      add: 'افزودن سرور',
      cancel: 'انصراف',
    },
    settings: {
      title: 'تنظیمات',
      general: 'عمومی',
      appearance: 'ظاهر',
      network: 'شبکه',
      about: 'درباره',
      language: 'زبان',
      languageDesc: 'زبان مورد نظر خود را انتخاب کنید',
      theme: 'تم',
      themeDesc: 'تم مورد نظر خود را انتخاب کنید',
      dark: 'تیره',
      light: 'روشن',
      system: 'سیستم',
      startMinimized: 'شروع کوچک‌شده',
      startMinimizedDesc: 'برنامه در سینی سیستم شروع شود',
      minimizeToTray: 'کوچک شدن در سینی',
      minimizeToTrayDesc: 'به جای بستن، در سینی سیستم کوچک شود',
      autoStart: 'شروع خودکار',
      autoStartDesc: 'برنامه با روشن شدن سیستم شروع شود',
      notifications: 'اعلان‌ها',
      notificationsDesc: 'نمایش اعلان‌های دسکتاپ',
      autoSync: 'همگام‌سازی خودکار',
      autoSyncDesc: 'همگام‌سازی خودکار لیست سرورها از گیت‌هاب',
      flushDns: 'پاک‌سازی کش DNS',
      flushDnsDesc: 'کش DNS را برای اعمال فوری تغییرات پاک کنید',
      flushNow: 'پاک‌سازی',
      networkInterface: 'رابط شبکه',
      networkInterfaceDesc: 'رابط شبکه‌ای که می‌خواهید تنظیم کنید را انتخاب کنید',
      version: 'نسخه',
      checkUpdates: 'بررسی به‌روزرسانی',
      github: 'مخزن گیت‌هاب',
      website: 'وب‌سایت',
      reportBug: 'گزارش باگ',
    },
    status: {
      connecting: 'در حال اتصال...',
      connected: 'با موفقیت متصل شد',
      disconnecting: 'در حال قطع اتصال...',
      disconnected: 'قطع شد',
      error: 'خطا رخ داد',
      flushing: 'در حال پاک‌سازی کش DNS...',
      flushed: 'کش DNS پاک شد',
    },
    errors: {
      connectionFailed: 'اتصال به سرور DNS ناموفق بود',
      disconnectionFailed: 'قطع اتصال از سرور DNS ناموفق بود',
      flushFailed: 'پاک‌سازی کش DNS ناموفق بود',
      adminRequired: 'نیاز به دسترسی مدیر است',
      networkError: 'خطای شبکه رخ داد',
      unknownError: 'خطای ناشناخته رخ داد',
    },
    common: {
      loading: 'در حال بارگذاری...',
      save: 'ذخیره',
      cancel: 'انصراف',
      confirm: 'تأیید',
      delete: 'حذف',
      edit: 'ویرایش',
      add: 'افزودن',
      close: 'بستن',
      yes: 'بله',
      no: 'خیر',
      ok: 'باشه',
      retry: 'تلاش مجدد',
      refresh: 'بازنشانی',
      copy: 'کپی',
      copied: 'کپی شد!',
    },
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function isRTL(lang: Language): boolean {
  return lang === 'fa';
}
