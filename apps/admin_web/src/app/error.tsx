'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Result, Button, Card, Space, Typography, Collapse } from 'antd';
import { ReloadOutlined, HomeOutlined, WarningOutlined, CodeOutlined } from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';

const { Title, Paragraph, Text } = Typography;

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to logging service (e.g. Sentry / CloudWatch)
    console.error('Unhandled Admin Web Runtime Error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        padding: adminDesignTokens.padding.lg,
      }}
    >
      <Card
        style={{
          maxWidth: 680,
          width: '100%',
          textAlign: 'center',
          borderRadius: adminDesignTokens.borderRadius.lg,
          boxShadow: '0 12px 32px rgba(239, 68, 68, 0.08)',
          border: `1px solid ${adminDesignTokens.colors.border}`,
        }}
      >
        <Result
          status="500"
          title={<Title level={2} style={{ color: adminDesignTokens.colors.statusRejected, margin: 0 }}>500 — Hệ Thống Gặp Sự Cố Xử Lý</Title>}
          subTitle={
            <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8 }}>
              Rất tiếc! Đã có lỗi bất ngờ xảy ra trong quá trình xử lý giao diện Admin Web.
            </Paragraph>
          }
          extra={
            <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 12 }}>
              <Space wrap align="center" style={{ justifyContent: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => reset()}
                  style={{ backgroundColor: adminDesignTokens.colors.primary, height: 44, padding: '0 24px', fontWeight: 600 }}
                >
                  Thử Tải Lại Trang
                </Button>
                <Link href="/">
                  <Button
                    size="large"
                    icon={<HomeOutlined />}
                    style={{ height: 44, padding: '0 24px', fontWeight: 600 }}
                  >
                    Về Trang Chủ Dashboard
                  </Button>
                </Link>
              </Space>

              {/* Collapsible Error Debug Details */}
              <div style={{ textAlign: 'left', marginTop: 16 }}>
                <Collapse
                  ghost
                  items={[
                    {
                      key: '1',
                      label: (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          <CodeOutlined style={{ marginRight: 6 }} />
                          Chi tiết kỹ thuật (Developer Info)
                        </Text>
                      ),
                      children: (
                        <div
                          style={{
                            backgroundColor: adminDesignTokens.colors.surface,
                            padding: 12,
                            borderRadius: adminDesignTokens.borderRadius.sm,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            wordBreak: 'break-all',
                            color: adminDesignTokens.colors.statusRejected,
                          }}
                        >
                          <Paragraph style={{ margin: 0, fontWeight: 600 }}>
                            <WarningOutlined style={{ marginRight: 6 }} />
                            {error?.name || 'Error'}: {error?.message || 'Lỗi không xác định'}
                          </Paragraph>
                          {error?.digest && (
                            <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 11 }}>
                              Digest Hash: {error.digest}
                            </Text>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
