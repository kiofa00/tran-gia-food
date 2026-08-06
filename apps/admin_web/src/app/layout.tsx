import '@ant-design/v5-patch-for-react-19';
import './globals.css';
import React from 'react';
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { adminDesignTokens } from '../theme/tokens';
import { QueryProvider } from '../providers/QueryProvider';

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
                <style>{`
                  .ant-table-wrapper .ant-spin-nested-loading {
                    min-height: 260px;
                  }
                  .ant-table-wrapper .ant-spin-nested-loading .ant-spin {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    margin: 0 !important;
                  }
                  .table-filter-card .ant-card-body {
                    padding: 10px 14px !important;
                  }
                  .table-filter-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    width: 100%;
                  }
                  .table-filter-toolbar .filter-search-input,
                  .table-filter-toolbar .filter-search-input.ant-input-affix-wrapper {
                    flex: 1 1 260px;
                    max-width: 360px;
                    width: 100%;
                    height: 38px !important;
                    min-height: 38px !important;
                    max-height: 38px !important;
                    box-sizing: border-box !important;
                  }
                  .table-filter-toolbar .filter-select-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                  }
                  @media (max-width: 576px) {
                    .table-filter-card .ant-card-body {
                      padding: 10px 12px !important;
                    }
                    .table-filter-toolbar {
                      display: flex !important;
                      flex-direction: column !important;
                      align-items: stretch !important;
                      gap: 8px !important;
                    }
                    .table-filter-toolbar .filter-search-input,
                    .table-filter-toolbar .filter-search-input.ant-input-affix-wrapper {
                      width: 100% !important;
                      max-width: 100% !important;
                      height: 36px !important;
                      min-height: 36px !important;
                      max-height: 36px !important;
                      padding: 4px 11px !important;
                    }
                    .table-filter-toolbar .filter-search-input input {
                      font-size: 13px !important;
                      height: 28px !important;
                    }
                    .table-filter-toolbar .filter-select-group {
                      display: flex !important;
                      align-items: center !important;
                      justify-content: space-between !important;
                      width: 100% !important;
                      gap: 8px !important;
                    }
                    .table-filter-toolbar .filter-select-group .ant-select {
                      flex: 1 !important;
                      height: 36px !important;
                    }
                    .table-filter-toolbar .filter-select-group .ant-select-selector {
                      height: 36px !important;
                      display: flex !important;
                      align-items: center !important;
                      font-size: 13px !important;
                    }
                  }
                `}</style>
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
