'use client';

import React from 'react';

import { Divider, Layout, Space, Typography } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';
import { cn } from '@/utils/cn';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const { t } = useTranslation();

  return (
    <AntFooter
      data-testid="admin-footer"
      className={cn('text-center py-6 px-12 bg-white border-t border-gray-200 mt-auto', className)}
    >
      <Space split={<Divider type="vertical" />}>
        <Text className="text-gray-500">
          © {new Date().getFullYear()} Tran Gia Food Delivery Platform
        </Text>
        <Link href="https://github.com/kiofa00/tran-gia-food" target="_blank">
          {t('footer.apiDocs', 'Tài liệu API & Monorepo')}
        </Link>
        <Text className="text-gray-600">{`${t('footer.version', 'Phiên bản')} v1.0.0`}</Text>
      </Space>
    </AntFooter>
  );
};
