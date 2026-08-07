'use client';

import React from 'react';

import { ConfigProvider, theme } from 'antd';

import { useTheme } from '@/providers/ThemeProvider';
import { adminDesignTokens } from '@/theme/tokens';

export function AntdThemeConfig({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: adminDesignTokens.colors.primary,
          borderRadius: adminDesignTokens.borderRadiusAntd,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
