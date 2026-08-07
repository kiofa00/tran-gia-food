'use client';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  PercentageOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Space, Switch, Tag, Typography } from 'antd';

import { formatCurrency, formatDate } from '@/utils/formatters';

import type { VoucherRecord } from '../types';

const { Text } = Typography;

interface VoucherColumnsOptions {
  onToggleActive: (key: string, checked: boolean) => void;
}

export function getVoucherColumns({ onToggleActive }: VoucherColumnsOptions) {
  return [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.code.localeCompare(b.code),
      render: (code: string) => (
        <Tag
          color="volcano"
          icon={<TagOutlined />}
          className="text-xs font-bold px-2.5 py-0.5 rounded-md"
        >
          {code}
        </Tag>
      ),
    },
    {
      title: 'Loại Ưu Đãi',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 180,
      render: (type: string, record: VoucherRecord) => (
        <Space className="whitespace-nowrap">
          {type === 'percent' ? (
            <Tag color="purple" icon={<PercentageOutlined />}>
              Giảm {record.discountValue}%{' '}
              {record.maxDiscount ? `(Tối đa ${formatCurrency(record.maxDiscount)})` : ''}
            </Tag>
          ) : (
            <Tag color="green" icon={<DollarOutlined />}>
              Giảm {formatCurrency(record.discountValue)}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Đơn Tối Thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      width: 150,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.minOrderValue - b.minOrderValue,
      render: (val: number) => <Text className="whitespace-nowrap">{formatCurrency(val)}</Text>,
    },
    {
      title: 'Hạn Sử Dụng',
      key: 'validity',
      width: 220,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.validFrom.localeCompare(b.validFrom),
      render: (record: VoucherRecord) => (
        <Text type="secondary" className="text-xs whitespace-nowrap">
          <ClockCircleOutlined className="mr-1.5" />
          {formatDate(record.validFrom)} ➔ {formatDate(record.validTo)}
        </Text>
      ),
    },
    {
      title: 'Lượt Sử Dụng',
      key: 'usage',
      width: 160,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.usedCount - b.usedCount,
      render: (record: VoucherRecord) => (
        <Text className="whitespace-nowrap">
          <Text strong>{record.usedCount}</Text> / {record.totalLimit} lượt
        </Text>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 150,
      sorter: (a: VoucherRecord, b: VoucherRecord) => Number(a.isActive) - Number(b.isActive),
      render: (record: VoucherRecord) => {
        const isExpired = new Date(record.validTo) < new Date('2026-08-05');

        if (isExpired) {
          return (
            <Tag color="default" icon={<CloseCircleOutlined />}>
              Đã hết hạn
            </Tag>
          );
        }

        return record.isActive ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đang diễn ra
          </Tag>
        ) : (
          <Tag color="warning">Tạm dừng</Tag>
        );
      },
    },
    {
      title: 'Kích Hoạt',
      key: 'action',
      width: 120,
      render: (record: VoucherRecord) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => onToggleActive(record.key, checked)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
  ];
}
