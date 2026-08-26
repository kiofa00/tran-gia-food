import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { getLocale } from '@/hooks';
import { PAYOUT_STATUS_COLOR_MAP } from '@/shared-config';
import { formatCurrency } from '@/utils/formatters';

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

export function getPayoutColumns({
  onProcess,
  onReject,
}: {
  onProcess: (r: PayoutRecord) => void;
  onReject: (r: PayoutRecord) => void;
}): ColumnsType<PayoutRecord> {
  const { t } = getLocale();

  return [
    {
      title: t('restaurants.name', 'Nhà Hàng'),
      dataIndex: 'restaurantName',
      key: 'restaurantName',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: t('payouts.requestedAt', 'Kỳ Thanh Toán'),
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: t('payouts.amount', 'Số Tiền'),
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => <Text className="font-bold text-green-600">{formatCurrency(v)}</Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: t('payouts.accountNumber', 'Tài Khoản NH'),
      dataIndex: 'bankAccount',
      key: 'bankAccount',
      render: (v: string) => <Text copyable>{v}</Text>,
    },
    {
      title: t('payouts.status', 'Trạng Thái'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const PAYOUT_STATUS_LABELS: Record<string, string> = {
          PENDING: t('payouts.statusPending', 'Chờ giải ngân'),
          PROCESSED: t('payouts.statusCompleted', 'Đã giải ngân'),
        };

        return (
          <Tag color={(PAYOUT_STATUS_COLOR_MAP as Record<string, string>)[status] ?? 'default'}>
            {PAYOUT_STATUS_LABELS[status] ?? t('payouts.statusFailed', 'Bị từ chối')}
          </Tag>
        );
      },
    },
    {
      title: t('common.actions', 'Hành Động'),
      key: 'actions',
      render: (_, r) =>
        r.status !== 'PENDING' ? null : (
          <Space>
            <Button size="small" type="primary" onClick={() => onProcess(r)}>
              {t('payouts.process', 'Giải Ngân')}
            </Button>
            <Button size="small" danger onClick={() => onReject(r)}>
              {t('payouts.reject', 'Từ Chối')}
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
