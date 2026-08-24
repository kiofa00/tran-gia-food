'use client';

import { useCallback, useContext } from 'react';

import i18n, { TranslationKey } from '@/lib/i18n';
import { LanguageContext, LanguageOption, TranslationParams } from '@/providers/LanguageProvider';

import viFallback from '../locales/vi.json';

export interface LocaleContextType {
  locale: string;
  language: string;
  t: (
    key: TranslationKey,
    defaultTextOrParams?: string | TranslationParams,
    params?: TranslationParams,
  ) => string;
  setLanguage: (lang: string) => void;
  changeLocale: (lang: string) => void;
  availableLanguages: LanguageOption[];
}

/**
 * Module-level singleton that stores the locale value outside the React tree.
 * This allows plain TS utilities, formatters and helpers to access locale without hooks.
 */
let globalLocale: LocaleContextType | null = null;

/**
 * Client component hook for locale & translations (compatible with amaze-webapp pattern)
 */
export function useLocale(): LocaleContextType {
  const context = useContext(LanguageContext);

  const changeLocale = useCallback(
    (nextLocale: string) => {
      context.setLanguage(nextLocale);
    },
    [context],
  );

  return {
    locale: context.language,
    language: context.language,
    t: context.t,
    setLanguage: context.setLanguage,
    changeLocale,
    availableLanguages: context.availableLanguages,
  };
}

/**
 * Synchronizes the global locale singleton from the root React tree.
 * Automatically called inside LanguageProvider.
 */
export function useLocaleHelper() {
  const current = useLocale();

  globalLocale = current;
}

/**
 * For use in plain TS functions, utilities, formatters, and server helpers that cannot call hooks.
 *
 * Example:
 * ```ts
 * export function formatPrice(price: number) {
 *   const { t, locale } = getLocale();
 *   return `${new Intl.NumberFormat(locale).format(price)} ${t('currency', 'đ')}`;
 * }
 * ```
 */
export function getLocale(): LocaleContextType {
  if (globalLocale) {
    return globalLocale;
  }

  // Safe fallback for server-side execution, unit tests, or before root component mount
  const currentLang = i18n.language || 'vi';
  const t = (
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
  };

  return {
    locale: currentLang,
    language: currentLang,
    t,
    setLanguage: (lang: string) => i18n.changeLanguage(lang),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    availableLanguages: [
      { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'en', label: 'English', flag: '🇺🇸' },
    ],
  };
}
