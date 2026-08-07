'use client';

import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { App, Button, Space, Tag, Typography } from 'antd';

import { PlateBadge, VehicleBadge } from '@/components/shared-ui';
import { useTranslation } from '@/providers/LanguageProvider';
import { mapKycStatus } from '@/utils/formatters';

import { useVerifyShipperKycMutation } from '../hooks/useAdmin';
import { PendingShipperRecord } from '../types';

const { Text } = Typography;

export function useShipperKycColumns() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const verifyKycMutation = useVerifyShipperKycMutation();

  const handleApproveKyc = (id: string, name: string) => {
    verifyKycMutation.mutate(
      { id, action: 'approve' },
      {
        onSuccess: () =>
          message.success(
            t('dashboard.approveKycSuccess', 'Đã duyệt hồ sơ eKYC cho tài xế {name} thành công!', {
              name,
            }),
          ),
        onError: () => message.error(t('dashboard.approveKycFailed', 'Duyệt eKYC thất bại')),
      },
    );
  };

  const handleRejectKyc = (id: string, name: string) => {
    verifyKycMutation.mutate(
      { id, action: 'reject' },
      {
        onSuccess: () =>
          message.info(
            t('dashboard.rejectKycSuccess', 'Đã từ chối eKYC của tài xế {name}', { name }),
          ),
        onError: () => message.error(t('dashboard.rejectKycFailed', 'Từ chối eKYC thất bại')),
      },
    );
  };

  return [
    {
      title: t('dashboard.shipperId', 'Mã Tài Xế'),
      dataIndex: 'id',
      key: 'id',
      width: 120,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) => a.id.localeCompare(b.id),
      render: (id: string) => (
        <Text strong className="text-orange-500 whitespace-nowrap">
          {id}
        </Text>
      ),
    },
    {
      title: t('dashboard.fullName', 'Họ & Tên'),
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Text strong className="whitespace-nowrap">
          {name}
        </Text>
      ),
    },
    {
      title: t('users.phone', 'Số Điện Thoại'),
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => <Text className="whitespace-nowrap">{text}</Text>,
    },
    {
      title: t('dashboard.vehicleType', 'Loại Xe'),
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 180,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) =>
        a.vehicle.localeCompare(b.vehicle),
      render: (text: string) => <VehicleBadge vehicle={text} />,
    },
    {
      title: t('dashboard.plateNumber', 'Biển Số Xe'),
      dataIndex: 'plate',
      key: 'plate',
      width: 150,
      render: (plate: string) => <PlateBadge plate={plate} />,
    },
    {
      title: t('dashboard.kycStatus', 'Trạng Thái eKYC'),
      dataIndex: 'status',
      key: 'status',
      width: 170,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) =>
        a.status.localeCompare(b.status),
      render: (status: string) => {
        const meta = mapKycStatus(status);

        return (
          <Tag
            icon={<ClockCircleOutlined />}
            color={meta.tagColor}
            className="text-xs px-2.5 py-0.5 whitespace-nowrap"
          >
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: t('common.actions', 'Hành Động'),
      key: 'action',
      width: 260,
      render: (record: PendingShipperRecord) => (
        <Space size="small" className="whitespace-nowrap">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            className="bg-green-600 hover:bg-green-500 border-none"
            onClick={() => handleApproveKyc(record.id, record.name)}
          >
            {t('dashboard.approveKyc', 'Duyệt eKYC')}
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleRejectKyc(record.id, record.name)}
          >
            {t('dashboard.rejectKyc', 'Từ Chối')}
          </Button>
        </Space>
      ),
    },
  ];
}
