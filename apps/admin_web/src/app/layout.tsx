import React from 'react';
import { ConfigProvider } from 'antd';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { adminDesignTokens } from '../theme/tokens';

export const metadata = {
  title: 'Tran Gia Food — Admin Dashboard',
  description: 'Admin portal for Tran Gia Food delivery platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
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
      </body>
    </html>
  );
}
