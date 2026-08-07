import React from 'react';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';

import { QueryProvider } from '@/providers/QueryProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { adminDesignTokens } from '@/theme/tokens';

import './globals.css';

if (typeof window !== 'undefined') {
  const origWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[antd: compatible]')) return;
    origWarn(...args);
  };
  const origError = console.error;

  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[antd: compatible]')) return;
    origError(...args);
  };
}

export const metadata = {
  title: 'Tran Gia Food — Admin Dashboard',
  description: 'Admin portal for Tran Gia Food delivery platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="m-0 p-0 font-sans">
        <SessionProvider>
          <QueryProvider>
            <AntdRegistry>
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: adminDesignTokens.colors.primary,
                    borderRadius: adminDesignTokens.borderRadiusAntd,
                  },
                }}
              >
                {children}
              </ConfigProvider>
            </AntdRegistry>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
