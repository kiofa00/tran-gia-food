'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { I18nextProvider, useTranslation as useReactI18nextTranslation } from 'react-i18next';

import { useCmsQuery } from '@/components/features/cms';
import i18n, { TranslationKey } from '@/lib/i18n';

import viFallback from '../locales/vi.json';

const STORAGE_KEY_ADMIN_LANG = 'admin_lang';

export interface LanguageOption {
  code: string;
  label: string;
  flag: string;
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

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {},
  availableLanguages: [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ],
  t: (key, defaultTextOrParams, params) => {
    const interpolations = typeof defaultTextOrParams === 'object' ? defaultTextOrParams : params;
    const defaultText = typeof defaultTextOrParams === 'string' ? defaultTextOrParams : undefined;

    return i18n.t(key, {
      defaultValue: defaultText || viFallback[key] || key,
      ...(interpolations || {}),
    });
  },
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('vi');
  const { data: cmsData } = useCmsQuery();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_LANG);

      if (saved) {
        setLanguageState(saved);
        i18n.changeLanguage(saved);
        document.documentElement.lang = saved;
      } else {
        document.documentElement.lang = 'vi';
      }
    } catch {
      document.documentElement.lang = 'vi';
    }
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_LANG, lang);
    } catch {
      // Safe fallback if localStorage access is restricted
    }
    document.documentElement.lang = lang;
  }, []);

  /** Dynamically inject CMS translations into i18next resource bundles */
  useEffect(() => {
    if (cmsData?.translations && Array.isArray(cmsData.translations)) {
      const cmsResources: Record<string, Record<string, string>> = {};

      cmsData.translations.forEach((item) => {
        if (item.key) {
          Object.keys(item).forEach((propKey) => {
            if (
              propKey !== 'id' &&
              propKey !== 'key' &&
              propKey !== 'appTarget' &&
              propKey !== 'category' &&
              propKey !== 'createdAt' &&
              propKey !== 'updatedAt' &&
              typeof item[propKey] === 'string'
            ) {
              const langCode = propKey.toLowerCase();

              if (!cmsResources[langCode]) {
                cmsResources[langCode] = {};
              }
              cmsResources[langCode][item.key] = item[propKey] as string;
            }
          });
        }
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
          if (
            propKey !== 'id' &&
            propKey !== 'key' &&
            propKey !== 'appTarget' &&
            propKey !== 'category' &&
            propKey !== 'createdAt' &&
            propKey !== 'updatedAt' &&
            typeof item[propKey] === 'string'
          ) {
            langSet.add(propKey.toLowerCase());
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

      return i18n.t(key, {
        defaultValue: defaultText || viFallback[key] || key,
        ...(interpolations || {}),
      });
    },
    [],
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

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  const reactI18n = useReactI18nextTranslation();

  return {
    ...context,
    i18n: reactI18n.i18n,
  };
};
