import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { PAYOUT_STATUS_COLOR_MAP } from '@/shared-config';

const { Text } = Typography;

export interface PayoutRecord {
  id: string;
  restaurantName: string;
  restaurantId: string;
  amount: number;
  status: string;
  period: string;
  bankAccount: string;
  createdAt: string;
}

function formatCurrency(v: number): string {
  return `${v.toLocaleString('vi-VN')}đ`;
}

export function getPayoutColumns({
  onProcess,
  onReject,
}: {
  onProcess: (r: PayoutRecord) => void;
  onReject: (r: PayoutRecord) => void;
}): ColumnsType<PayoutRecord> {
  return [
    {
      title: 'Nhà Hàng',
      dataIndex: 'restaurantName',
      key: 'restaurantName',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Kỳ Thanh Toán',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => <Text className="font-bold text-green-600">{formatCurrency(v)}</Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Tài Khoản NH',
      dataIndex: 'bankAccount',
      key: 'bankAccount',
      render: (v: string) => <Text copyable>{v}</Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const PAYOUT_STATUS_LABELS: Record<string, string> = {
          PENDING: 'Chờ giải ngân',
          PROCESSED: 'Đã giải ngân',
        };

        return (
          <Tag color={PAYOUT_STATUS_COLOR_MAP[status] ?? 'default'}>
            {PAYOUT_STATUS_LABELS[status] ?? 'Bị từ chối'}
          </Tag>
        );
      },
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, r) =>
        r.status !== 'PENDING' ? null : (
          <Space>
            <Button size="small" type="primary" onClick={() => onProcess(r)}>
              Giải Ngân
            </Button>
            <Button size="small" danger onClick={() => onReject(r)}>
              Từ Chối
            </Button>
          </Space>
        ),
    },
  ];
}

export function mapPayoutRecord(item: Record<string, unknown>): PayoutRecord {
  const restaurant = (item.restaurant as Record<string, unknown>) ?? {};

  return {
    id: String(item.id ?? ''),
    restaurantName: String(restaurant.name ?? ''),
    restaurantId: String(item.restaurantId ?? ''),
    amount: Number(item.restaurantShare ?? item.amount ?? 0),
    status: String(item.status ?? 'PENDING'),
    period: String(item.period ?? ''),
    bankAccount: String(
      (restaurant.bankAccount as Record<string, unknown>)?.accountNumber ?? 'N/A',
    ),
    createdAt: String(item.createdAt ?? ''),
  };
}
