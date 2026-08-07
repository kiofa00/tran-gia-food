'use client';

import { Tag, Typography } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';
import { TopRestaurantItem } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

export function useTopRestaurantsColumns() {
  const { t } = useTranslation();

  return [
    {
      title: t('analytics.growth', 'Hạng'),
      dataIndex: 'rank',
      key: 'rank',
      width: 90,
      sorter: (a: TopRestaurantItem, b: TopRestaurantItem) => (a.rank || 0) - (b.rank || 0),
      render: (rank: number) => {
        if (rank === 1)
          return (
            <Tag color="gold" className="font-bold text-xs px-2.5 py-0.5">
              🥇 #1
            </Tag>
          );
        if (rank === 2)
          return (
            <Tag color="cyan" className="font-bold text-xs px-2.5 py-0.5">
              🥈 #2
            </Tag>
          );
        if (rank === 3)
          return (
            <Tag color="orange" className="font-bold text-xs px-2.5 py-0.5">
              🥉 #3
            </Tag>
          );

        return (
          <Tag color="default" className="font-semibold text-xs px-2.5 py-0.5">
            #{rank}
          </Tag>
        );
      },
    },
    {
      title: t('analytics.restaurantName', 'Tên Nhà Hàng'),
      dataIndex: 'name',
      key: 'name',
      width: 260,
      sorter: (a: TopRestaurantItem, b: TopRestaurantItem) =>
        (a.name || '').localeCompare(b.name || ''),
      render: (text: string) => (
        <Text strong className="whitespace-nowrap">
          {text}
        </Text>
      ),
    },
    {
      title: t('analytics.revenue', 'Tổng Doanh Số (GMV)'),
      dataIndex: 'gmv',
      key: 'gmv',
      width: 200,
      sorter: (a: TopRestaurantItem & { gmv?: number }, b: TopRestaurantItem & { gmv?: number }) =>
        (a.gmv || a.revenue || 0) - (b.gmv || b.revenue || 0),
      render: (val: number) => (
        <Text strong className="text-orange-500 whitespace-nowrap">
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: t('commissions.totalRevenue', 'Hoa Hồng Nền Tảng (15%)'),
      dataIndex: 'commission',
      key: 'commission',
      width: 200,
      sorter: (
        a: TopRestaurantItem & { commission?: number },
        b: TopRestaurantItem & { commission?: number },
      ) => (a.commission || 0) - (b.commission || 0),
      render: (val: number) => (
        <Text className="text-green-600 font-semibold whitespace-nowrap">
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: t('analytics.ordersCount', 'Số Đơn Hàng'),
      dataIndex: 'orders',
      key: 'orders',
      width: 140,
      sorter: (
        a: TopRestaurantItem & { orders?: number },
        b: TopRestaurantItem & { orders?: number },
      ) => (a.orders || a.ordersCount || 0) - (b.orders || b.ordersCount || 0),
      render: (val: number) => (
        <Tag color="blue" className="text-xs px-2.5 py-0.5">
          {val} {t('common.items', 'đơn')}
        </Tag>
      ),
    },
  ];
}
