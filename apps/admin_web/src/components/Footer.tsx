'use client';

import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

export const Footer: React.FC = () => {
  return (
    <AntFooter
      data-testid="admin-footer"
      className="text-center py-6 px-12 bg-white border-t border-gray-200 mt-auto"
    >
      <Space split={<Divider type="vertical" />}>
        <Text className="text-gray-500">
          © {new Date().getFullYear()} Tran Gia Food Delivery Platform
        </Text>
        <Link href="https://github.com/kiofa00/tran-gia-food" target="_blank">
          Tài liệu API & Monorepo
        </Link>
        <Text className="text-gray-600">Phiên bản v1.0.0</Text>
      </Space>
    </AntFooter>
  );
};
