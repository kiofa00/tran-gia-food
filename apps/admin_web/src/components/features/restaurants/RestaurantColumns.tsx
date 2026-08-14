import { Button, Space, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { RESTAURANT_STATUS_COLOR_MAP } from '@/shared-config';

const { Text } = Typography;

export interface RestaurantRecord {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  status: string;
  avgRating: number;
  totalOrders: number;
  createdAt: string;
}

export function getRestaurantColumns({
  onApprove,
  onSuspend,
  onView,
}: {
  onApprove: (r: RestaurantRecord) => void;
  onSuspend: (r: RestaurantRecord) => void;
  onView: (r: RestaurantRecord) => void;
}): ColumnsType<RestaurantRecord> {
  return [
    {
      title: 'Nhà Hàng',
      key: 'name',
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text strong>{r.name}</Text>
          <Text type="secondary" className="text-xs">
            {r.address}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Chủ Sở Hữu',
      key: 'owner',
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text>{r.ownerName}</Text>
          <Text type="secondary" className="text-xs">
            {r.phone}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const RESTAURANT_STATUS_LABELS: Record<string, string> = {
          PENDING: 'Chờ duyệt',
          APPROVED: 'Hoạt động',
        };

        return (
          <Tag color={RESTAURANT_STATUS_COLOR_MAP[status] ?? 'default'}>
            {RESTAURANT_STATUS_LABELS[status] ?? 'Đình chỉ'}
          </Tag>
        );
      },
    },
    {
      title: 'Đánh Giá',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (v: number) => <Text>⭐ {v.toFixed(1)}</Text>,
      sorter: (a, b) => a.avgRating - b.avgRating,
    },
    {
      title: 'Tổng Đơn',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" onClick={() => onView(r)}>
              Chi Tiết
            </Button>
          </Tooltip>
          {r.status === 'PENDING' && (
            <Button size="small" type="primary" onClick={() => onApprove(r)}>
              Duyệt
            </Button>
          )}
          {r.status === 'APPROVED' && (
            <Button size="small" danger onClick={() => onSuspend(r)}>
              Đình Chỉ
            </Button>
          )}
        </Space>
      ),
    },
  ];
}

export function mapRestaurantRecord(item: Record<string, unknown>): RestaurantRecord {
  const owner = (item.owner as Record<string, unknown>) ?? {};

  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    ownerName: String(owner.name ?? ''),
    phone: String(owner.phone ?? item.phone ?? ''),
    address: String(item.address ?? ''),
    status: String(item.status ?? 'PENDING'),
    avgRating: Number(item.avgRating ?? 0),
    totalOrders: Number(item.totalOrders ?? 0),
    createdAt: String(item.createdAt ?? ''),
  };
}
