'use client';

import React from 'react';

import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Space, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { useLocale } from '@/hooks/useLocale';
import { formatDateTime } from '@/utils';

import type { KycRecord, KycStatus } from '../types';
import { KycStatusBadge } from './KycStatusBadge';

const { Text } = Typography;

interface UseKycColumnsOptions {
  onOpenDrawer: (record: KycRecord) => void;
  getVehicleLabel: (type: string) => string;
}

export function useKycColumns({
  onOpenDrawer,
  getVehicleLabel,
}: UseKycColumnsOptions): ColumnsType<KycRecord> {
  const { t } = useLocale();

  return [
    {
      title: t('kyc.driver', 'Tài xế'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, rec: KycRecord) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-orange-500" />
          <div>
            <Text strong className="block">
              {name}
            </Text>
            <Text type="secondary" className="text-xs">
              {rec.phone}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('kyc.cccd', 'Số CCCD'),
      dataIndex: 'cccd',
      key: 'cccd',
      render: (cccd: string) => <Text code>{cccd || 'N/A'}</Text>,
    },
    {
      title: t('kyc.vehicle', 'Phương tiện'),
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (v: string) => getVehicleLabel(v),
    },
    {
      title: t('kyc.submittedAt', 'Ngày nộp'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (dt: string) => <Text className="text-xs text-gray-500">{formatDateTime(dt)}</Text>,
    },
    {
      title: t('kyc.status', 'Trạng thái'),
      dataIndex: 'status',
      key: 'status',
      render: (s: KycStatus) => <KycStatusBadge status={s} />,
    },
    {
      title: t('kyc.actions', 'Hành động'),
      key: 'action',
      render: (_: unknown, rec: KycRecord) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => onOpenDrawer(rec)}
          type={rec.status === 'PENDING' ? 'primary' : 'default'}
          className={
            rec.status === 'PENDING' ? 'bg-orange-500 hover:bg-orange-400 border-none' : ''
          }
        >
          {rec.status === 'PENDING' ? t('kyc.review', 'Xem xét') : t('common.details', 'Chi tiết')}
        </Button>
      ),
    },
  ];
}
