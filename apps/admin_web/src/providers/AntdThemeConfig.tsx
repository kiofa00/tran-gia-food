'use client';

import React from 'react';

import { App, ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';

import { useLocale } from '@/hooks/useLocale';
import { adminDesignTokens } from '@/theme/tokens';

export function AntdThemeConfig({ children }: { children: React.ReactNode }) {
  const { language } = useLocale();
  const antdLocale = language === 'en' ? enUS : viVN;

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: adminDesignTokens.colors.primary,
          borderRadius: adminDesignTokens.borderRadiusAntd,
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
