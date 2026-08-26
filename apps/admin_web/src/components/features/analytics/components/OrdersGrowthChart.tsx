'use client';

import React from 'react';

import { Card, Empty, Space, Spin, Typography } from 'antd';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useLocale } from '@/hooks/useLocale';
import { adminDesignTokens } from '@/theme/tokens';

import { ProcessedTrendItem } from './RevenueTrendChart';

const { Text } = Typography;

interface OrdersGrowthChartProps {
  trendData: ProcessedTrendItem[];
  loading: boolean;
}

export const OrdersGrowthChart: React.FC<OrdersGrowthChartProps> = ({ trendData, loading }) => {
  const { t } = useLocale();

  return (
    <Card
      title={t('analytics.ordersGrowthTitle', '📦 Tăng Trưởng Số Lượng Đơn Hàng Theo Ngày')}
      variant="borderless"
      className="rounded-xl shadow-xs"
    >
      <div className="w-full h-72 flex items-center justify-center">
        {loading && (
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text type="secondary">{t('common.loading', 'Đang tải dữ liệu...')}</Text>
          </Space>
        )}
        {!loading && trendData.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('analytics.noOrderData', 'Chưa có dữ liệu đơn hàng')}
          />
        )}
        {!loading && trendData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="orders"
                name={t('analytics.orderCount', 'Số đơn hàng')}
                fill={adminDesignTokens.colors.chartBlue}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
