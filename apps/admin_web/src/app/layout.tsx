import React from 'react';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';

import { AntdThemeConfig } from '@/providers/AntdThemeConfig';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

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
    <html lang="vi" suppressHydrationWarning>
      <body className="m-0 p-0 font-sans dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider>
              <LanguageProvider>
                <AntdRegistry>
                  <AntdThemeConfig>{children}</AntdThemeConfig>
                </AntdRegistry>
              </LanguageProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
