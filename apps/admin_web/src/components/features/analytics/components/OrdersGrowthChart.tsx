'use client';

import React from 'react';

import { Card, Empty, Space, Spin, Typography } from 'antd';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { adminDesignTokens } from '@/theme/tokens';

import { ProcessedTrendItem } from './RevenueTrendChart';

const { Text } = Typography;

interface OrdersGrowthChartProps {
  trendData: ProcessedTrendItem[];
  loading: boolean;
}

export const OrdersGrowthChart: React.FC<OrdersGrowthChartProps> = ({ trendData, loading }) => {
  return (
    <Card
      title="📦 Tăng Trưởng Số Lượng Đơn Hàng Theo Ngày"
      variant="borderless"
      className="rounded-xl shadow-xs"
    >
      <div className="w-full h-72 flex items-center justify-center">
        {loading && (
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text type="secondary">Đang tải dữ liệu đơn hàng...</Text>
          </Space>
        )}
        {!loading && trendData.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu đơn hàng" />
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
                name="Số đơn hàng"
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
