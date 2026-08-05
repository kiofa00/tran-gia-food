'use client';

import React from 'react';
import Link from 'next/link';
import { Result, Button, Card, Space, Typography } from 'antd';
import { HomeOutlined, CarOutlined, ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';

const { Title, Paragraph, Text } = Typography;

export default function NotFound() {
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
          boxShadow: '0 12px 32px rgba(255, 107, 0, 0.08)',
          border: `1px solid ${adminDesignTokens.colors.border}`,
        }}
      >
        <Result
          status="404"
          title={<Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>404 — Không Tìm Thấy Trang</Title>}
          subTitle={
            <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8 }}>
              Rất tiếc! Trang bạn đang truy cập không tồn tại hoặc đã đổi sang đường dẫn khác trong hệ thống <strong>Tran Gia Food Admin</strong>.
            </Paragraph>
          }
          extra={
            <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 12 }}>
              <Space wrap align="center" style={{ justifyContent: 'center' }}>
                <Link href="/">
                  <Button
                    type="primary"
                    size="large"
                    icon={<HomeOutlined />}
                    style={{ backgroundColor: adminDesignTokens.colors.primary, height: 44, padding: '0 24px', fontWeight: 600 }}
                  >
                    Về Trang Chủ Dashboard
                  </Button>
                </Link>
                <Link href="/fleet">
                  <Button
                    size="large"
                    icon={<CarOutlined />}
                    style={{ height: 44, padding: '0 24px', fontWeight: 600 }}
                  >
                    Giám Sát Đội Xe
                  </Button>
                </Link>
                <Button
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.history.back()}
                  style={{ height: 44, padding: '0 24px' }}
                >
                  Quay Lại
                </Button>
              </Space>

              <div
                style={{
                  backgroundColor: adminDesignTokens.colors.surface,
                  borderRadius: adminDesignTokens.borderRadius.md,
                  padding: 16,
                  textAlign: 'left',
                  marginTop: 16,
                  border: `1px dashed ${adminDesignTokens.colors.border}`,
                }}
              >
                <Text strong style={{ color: adminDesignTokens.colors.textPrimary }}>
                  <QuestionCircleOutlined style={{ marginRight: 8, color: adminDesignTokens.colors.primary }} />
                  Gợi Ý Hỗ Trợ:
                </Text>
                <ul style={{ margin: '8px 0 0 20px', padding: 0, color: adminDesignTokens.colors.textSecondary, fontSize: 14 }}>
                  <li>Kiểm tra lại đường dẫn URL trên thanh địa chỉ trình duyệt.</li>
                  <li>Nếu bạn vừa nhấp vào một liên kết từ trang khác, liên kết đó có thể bị hỏng.</li>
                  <li>Liên hệ với bộ phận Kỹ thuật Tran Gia Food nếu sự cố tiếp tục xảy ra.</li>
                </ul>
              </div>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
