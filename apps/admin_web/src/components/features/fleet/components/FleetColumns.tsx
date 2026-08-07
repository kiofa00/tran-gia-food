'use client';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CompassOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Tag, Typography } from 'antd';

import { PlateBadge, VehicleBadge } from '@/components/shared-ui';
import { useTranslation } from '@/providers/LanguageProvider';
import { ShipperRecord } from '@/types';
import { mapShipperStatus } from '@/utils/formatters';

const { Text } = Typography;

export function useFleetColumns() {
  const { t } = useTranslation();

  return [
    {
      title: t('fleet.shipperCode', 'Mã Shipper'),
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => (
        <Text strong className="whitespace-nowrap">
          {id}
        </Text>
      ),
    },
    {
      title: t('fleet.driverName', 'Tài Xế'),
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a: ShipperRecord, b: ShipperRecord) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Text strong className="whitespace-nowrap">
          {text}
        </Text>
      ),
    },
    {
      title: t('fleet.phone', 'Số Điện Thoại'),
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (text: string) => <Text className="whitespace-nowrap">{text}</Text>,
    },
    {
      title: t('fleet.vehicle', 'Phương Tiện'),
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 160,
      render: (type: string) => <VehicleBadge vehicle={type} />,
    },
    {
      title: t('fleet.plate', 'Biển Số Xe'),
      dataIndex: 'plate',
      key: 'plate',
      width: 160,
      render: (plate: string) => <PlateBadge plate={plate} />,
    },
    {
      title: t('fleet.gps', 'Tọa Độ GPS'),
      key: 'gps',
      width: 180,
      render: (_: unknown, record: ShipperRecord) => (
        <Tag icon={<CompassOutlined />} color="purple" className="text-xs px-2.5 py-0.5">
          {record.lat.toFixed(4)}, {record.lng.toFixed(4)}
        </Tag>
      ),
    },
    {
      title: t('fleet.status', 'Trạng Thái'),
      dataIndex: 'status',
      key: 'status',
      width: 220,
      sorter: (a: ShipperRecord, b: ShipperRecord) => a.status.localeCompare(b.status),
      render: (status: string) => {
        const meta = mapShipperStatus(status);
        let icon = <CloseCircleOutlined />;

        if (meta.tagColor === 'success') {
          icon = <CheckCircleOutlined />;
        } else if (meta.tagColor === 'warning' || meta.tagColor === 'processing') {
          icon = <SyncOutlined spin />;
        }

        return (
          <Tag color={meta.tagColor} icon={icon} className="whitespace-nowrap">
            {meta.label}
          </Tag>
        );
      },
    },
  ];
}
