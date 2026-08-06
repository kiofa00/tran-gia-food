import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { adminDesignTokens } from '../theme/tokens';
import { QueryProvider } from '../providers/QueryProvider';

if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[antd: compatible]')) return;
    origWarn(...args);
  };
  const origError = console.error;
  console.error = (...args: any[]) => {
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
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <QueryProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: adminDesignTokens.colors.primary,
                  borderRadius: 8,
                },
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: adminDesignTokens.colors.background }}>
                <Header title="Tran Gia Food — Admin Portal" userName="Admin Tran Gia" />
                <main style={{ flex: 1 }}>{children}</main>
                <Footer />
              </div>
            </ConfigProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
