'use client';

import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';

import { CommissionRecord } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

export function getCommissionsColumns() {
  return [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 140,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.orderId.localeCompare(b.orderId),
      render: (id: string) => (
        <Text strong className="text-orange-500 whitespace-nowrap">
          {id}
        </Text>
      ),
    },
    {
      title: 'Tên Quán Ăn',
      dataIndex: 'restaurantName',
      key: 'restaurantName',
      width: 200,
      sorter: (a: CommissionRecord, b: CommissionRecord) =>
        a.restaurantName.localeCompare(b.restaurantName),
      render: (text: string) => (
        <Text strong className="whitespace-nowrap">
          {text}
        </Text>
      ),
    },
    {
      title: 'Tiền Món (GMV)',
      dataIndex: 'foodAmount',
      key: 'foodAmount',
      width: 150,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.foodAmount - b.foodAmount,
      render: (val: number) => <Text className="whitespace-nowrap">{formatCurrency(val)}</Text>,
    },
    {
      title: 'Phí Ship',
      dataIndex: 'shipAmount',
      key: 'shipAmount',
      width: 130,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.shipAmount - b.shipAmount,
      render: (val: number) => <Text className="whitespace-nowrap">{formatCurrency(val)}</Text>,
    },
    {
      title: 'Ví Quán (85%)',
      dataIndex: 'restaurantShare',
      key: 'restaurantShare',
      width: 150,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.restaurantShare - b.restaurantShare,
      render: (val: number) => (
        <Text className="text-green-600 font-semibold whitespace-nowrap">
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Ví Shipper (100% Ship)',
      dataIndex: 'shipperShare',
      key: 'shipperShare',
      width: 180,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.shipperShare - b.shipperShare,
      render: (val: number) => (
        <Text className="text-blue-500 font-semibold whitespace-nowrap">{formatCurrency(val)}</Text>
      ),
    },
    {
      title: 'Hoa Hồng Sàn (15%)',
      dataIndex: 'platformShare',
      key: 'platformShare',
      width: 170,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.platformShare - b.platformShare,
      render: (val: number) => (
        <Text className="text-orange-500 font-bold whitespace-nowrap">{formatCurrency(val)}</Text>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.status.localeCompare(b.status),
      render: (status: string) => (
        <Tag
          color={status === 'PROCESSED' ? 'success' : 'warning'}
          icon={status === 'PROCESSED' ? <CheckCircleOutlined /> : <SyncOutlined spin />}
          className="whitespace-nowrap"
        >
          {status === 'PROCESSED' ? 'Đã Giải Ngân' : 'Chờ Quyết Toán'}
        </Tag>
      ),
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.createdAt.localeCompare(b.createdAt),
      render: (date: string) => (
        <Text type="secondary" className="whitespace-nowrap">
          {date}
        </Text>
      ),
    },
  ];
}
