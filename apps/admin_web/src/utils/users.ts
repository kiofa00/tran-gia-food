import type { TranslationKey } from '@/providers/LanguageProvider';
import { ROLE_FILTER_RAW, STATUS_FILTER_RAW } from '@/shared-config';

export type TranslateFn = (key: TranslationKey, fallback?: string) => string;

export const getRoleFilterOptions = (t: TranslateFn) =>
  ROLE_FILTER_RAW.map((item) => ({
    label: t(item.i18nKey, item.defaultLabel),
    value: item.value,
  }));

export const getStatusFilterOptions = (t: TranslateFn) =>
  STATUS_FILTER_RAW.map((item) => ({
    label: t(item.i18nKey, item.defaultLabel),
    value: item.value,
  }));
