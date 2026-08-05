'use client';

import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import { adminDesignTokens } from '../theme/tokens';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

export const Footer: React.FC = () => {
  return (
    <AntFooter
      data-testid="admin-footer"
      style={{
        textAlign: 'center',
        padding: '24px 50px',
        backgroundColor: '#ffffff',
        borderTop: `1px solid ${adminDesignTokens.colors.border}`,
        marginTop: 'auto',
      }}
    >
      <Space split={<Divider type="vertical" />}>
        <Text style={{ color: adminDesignTokens.colors.textSecondary }}>
          © {new Date().getFullYear()} Tran Gia Food Delivery Platform
        </Text>
        <Link href="https://github.com/kiofa00/tran-gia-food" target="_blank">
          Tài liệu API & Monorepo
        </Link>
        <Text style={{ color: adminDesignTokens.colors.textMuted }}>Phiên bản v1.0.0</Text>
      </Space>
    </AntFooter>
  );
};
