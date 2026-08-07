'use client';

import React from 'react';

import { CheckCircleOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Space, Tag, Typography } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';

const { Text } = Typography;

interface CmsServerStatusAlertProps {
  cmsStatus: string;
  onRefresh: () => void;
}

export const CmsServerStatusAlert: React.FC<CmsServerStatusAlertProps> = ({
  cmsStatus,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <Alert
      message={
        <Space align="center">
          <Text strong className="text-slate-800">
            {t('cms.serverStatus', 'Trạng Thái CMS Server')}:
          </Text>
          <Tag
            color={cmsStatus === 'online' ? 'success' : 'warning'}
            icon={<CheckCircleOutlined />}
          >
            {cmsStatus === 'online' ? 'ONLINE (HTTP 1337)' : 'OFFLINE / LOCAL STANDBY'}
          </Tag>
        </Space>
      }
      description={
        <div className="mt-2">
          <Text type="secondary">
            {t('cms.serverOnline', 'Đã kết nối NestJS CMS Backend (Port 3000)')}
          </Text>
          <div className="mt-3">
            <Button
              type="primary"
              icon={<ExportOutlined />}
              href="http://localhost:1337/admin"
              target="_blank"
              size="large"
            >
              Mở Trang Quản Trị Strapi CMS Admin Panel
            </Button>
            <Button icon={<ReloadOutlined />} onClick={onRefresh} className="ml-3">
              {t('dashboard.refreshBtn', 'Làm mới số liệu')}
            </Button>
          </div>
        </div>
      }
      type={cmsStatus === 'online' ? 'info' : 'warning'}
      showIcon
    />
  );
};
