import { useMemo } from 'react';
import { useStore } from '../store';
import { translations, isRTL, Language, Translations } from '../i18n';

export function useTranslation() {
  const config = useStore((state) => state.config);
  const language = (config.language || 'en') as Language;

  const t = useMemo((): Translations => {
    return translations[language] || translations.en;
  }, [language]);

  const rtl = useMemo(() => isRTL(language), [language]);
  const dir = rtl ? 'rtl' : 'ltr';

  return { t, language, rtl, dir };
}

export function useTheme() {
  const config = useStore((state) => state.config);
  const theme = config.theme || 'dark';

  const isDark = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

  return { theme, isDark };
}
