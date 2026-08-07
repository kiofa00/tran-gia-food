import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enFallback from '../locales/en.json';
import viFallback from '../locales/vi.json';

export type TranslationKey = keyof typeof viFallback;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof viFallback;
    };
  }
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: viFallback },
    en: { translation: enFallback },
  },
  lng: 'vi',
  fallbackLng: 'vi',
  interpolation: {
    prefix: '{',
    suffix: '}',
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
