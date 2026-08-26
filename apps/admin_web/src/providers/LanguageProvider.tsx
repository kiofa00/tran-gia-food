'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { I18nextProvider } from 'react-i18next';

import { useCmsQuery } from '@/components/features/cms/hooks/useCms';
import i18n, { TranslationKey } from '@/lib/i18n';
import {
  COOKIE_KEY_ADMIN_LANG,
  COOKIE_MAX_AGE_SECONDS,
  DEFAULT_LOCALE,
  STORAGE_KEY_ADMIN_LANG,
} from '@/shared-config';

import viFallback from '../locales/vi.json';

export interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

export interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: string;
}

export type { TranslationKey };
export type TranslationParams = Record<string, string | number>;

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  availableLanguages: LanguageOption[];
  t: (
    key: TranslationKey,
    defaultTextOrParams?: string | TranslationParams,
    params?: TranslationParams,
  ) => string;
}

const KNOWN_LANG_META: Record<string, { label: string; flag: string }> = {
  vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
  en: { label: 'English', flag: '🇺🇸' },
  ja: { label: '日本語', flag: '🇯🇵' },
  zh: { label: '中文', flag: '🇨🇳' },
  ko: { label: '한국어', flag: '🇰🇷' },
  fr: { label: 'Français', flag: '🇫🇷' },
  es: { label: 'Español', flag: '🇪🇸' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
};

function interpolateParams(text: string, params?: TranslationParams): string {
  if (!params || typeof text !== 'string') return text;

  let result = text;

  Object.entries(params).forEach(([key, val]) => {
    // Replace {key} and {{key}}
    result = result
      .replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val))
      .replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  });

  return result;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LOCALE,
  setLanguage: () => {},
  availableLanguages: [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ],
  t: (key, defaultTextOrParams, params) => {
    const interpolations = typeof defaultTextOrParams === 'object' ? defaultTextOrParams : params;
    const defaultText = typeof defaultTextOrParams === 'string' ? defaultTextOrParams : undefined;

    const raw = i18n.t(key, {
      defaultValue: defaultText || (viFallback as Record<string, string>)[key] || key,
      ...(interpolations || {}),
    });

    return interpolateParams(raw, interpolations);
  },
});

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLocale = DEFAULT_LOCALE,
}) => {
  const [language, setLanguageState] = useState<string>(initialLocale);
  const { data: cmsData } = useCmsQuery();

  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }

  const setLanguage = useCallback((nextLang: string) => {
    setLanguageState(nextLang);
    i18n.changeLanguage(nextLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLang;
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_LANG, nextLang);
        document.cookie = `${COOKIE_KEY_ADMIN_LANG}=${encodeURIComponent(nextLang)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
      } catch {
        // Ignore storage error
      }
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_LANG);

      if (saved && saved !== language) {
        setLanguage(saved);
      } else if (!saved) {
        localStorage.setItem(STORAGE_KEY_ADMIN_LANG, language);
        document.cookie = `${COOKIE_KEY_ADMIN_LANG}=${encodeURIComponent(language)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
      }
    } catch {
      // Ignore localStorage unavailable in strict sandboxes
    }
  }, [language, setLanguage]);

  /** Dynamically ingest CMS translations into i18next runtime cache */
  useEffect(() => {
    if (cmsData?.translations && Array.isArray(cmsData.translations)) {
      const cmsResources: Record<string, Record<string, string>> = {};

      cmsData.translations.forEach((item) => {
        const key = item.key;

        if (!key) return;

        Object.entries(item).forEach(([propKey, propVal]) => {
          if (propKey === 'id' || propKey === 'key' || typeof propVal !== 'string') return;
          const langCode = propKey.toLowerCase();

          if (!cmsResources[langCode]) {
            cmsResources[langCode] = {};
          }
          cmsResources[langCode][key] = propVal;
        });
      });

      Object.entries(cmsResources).forEach(([langCode, bundle]) => {
        i18n.addResourceBundle(langCode, 'translation', bundle, true, true);
      });
    }
  }, [cmsData]);

  /** Dynamically discover all language codes available from CMS translations */
  const availableLanguages = useMemo<LanguageOption[]>(() => {
    const langSet = new Set<string>(['vi', 'en']);

    if (cmsData?.translations && Array.isArray(cmsData.translations)) {
      cmsData.translations.forEach((item) => {
        Object.keys(item).forEach((propKey) => {
          const lower = propKey.toLowerCase();

          if (KNOWN_LANG_META[lower] || (/^[a-z]{2}$/.test(lower) && propKey !== 'id')) {
            langSet.add(lower);
          }
        });
      });
    }

    return Array.from(langSet).map((code) => {
      const meta = KNOWN_LANG_META[code] || {
        label: code.toUpperCase(),
        flag: '🌐',
      };

      return {
        code,
        label: meta.label,
        flag: meta.flag,
      };
    });
  }, [cmsData]);

  const t = useCallback(
    (
      key: TranslationKey,
      defaultTextOrParams?: string | TranslationParams,
      params?: TranslationParams,
    ): string => {
      let defaultText: string | undefined;
      let interpolations: TranslationParams | undefined;

      if (typeof defaultTextOrParams === 'object' && defaultTextOrParams !== null) {
        interpolations = defaultTextOrParams;
      } else {
        defaultText = defaultTextOrParams;
        interpolations = params;
      }

      const raw = i18n.t(key, {
        lng: language,
        defaultValue: defaultText || (viFallback as Record<string, string>)[key] || key,
        ...(interpolations || {}),
      });

      return interpolateParams(raw, interpolations);
    },
    [language],
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      availableLanguages,
      t,
    }),
    [language, setLanguage, availableLanguages, t],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
};
