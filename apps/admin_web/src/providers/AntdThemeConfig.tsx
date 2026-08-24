'use client';

import React from 'react';

import { ConfigProvider, theme } from 'antd';

import { adminDesignTokens } from '@/theme/tokens';

export function AntdThemeConfig({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
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
