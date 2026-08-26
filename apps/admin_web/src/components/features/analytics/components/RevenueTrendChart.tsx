'use client';

import React from 'react';

import { Card, Empty, Space, Spin, Typography } from 'antd';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useLocale } from '@/hooks/useLocale';
import { adminDesignTokens } from '@/theme/tokens';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

export interface ProcessedTrendItem {
  date: string;
  gmv: number;
  revenue: number;
  orders: number;
}

interface RevenueTrendChartProps {
  trendData: ProcessedTrendItem[];
  loading: boolean;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ trendData, loading }) => {
  const { t } = useLocale();

  return (
    <Card
      title={t('analytics.revenueTrendTitle', '📈 Xu Hướng Doanh Số GMV & Hoa Hồng Theo Ngày')}
      variant="borderless"
      className="rounded-xl shadow-xs"
    >
      <div className="w-full h-80 flex items-center justify-center">
        {loading && (
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text type="secondary">{t('common.loading', 'Đang tải dữ liệu...')}</Text>
          </Space>
        )}
        {!loading && trendData.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('analytics.noTrendData', 'Chưa có dữ liệu xu hướng doanh số')}
          />
        )}
        {!loading && trendData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={adminDesignTokens.colors.primary}
                    stopOpacity={0.8}
                  />
                  <stop offset="95%" stopColor={adminDesignTokens.colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={adminDesignTokens.colors.chartGreen}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={adminDesignTokens.colors.chartGreen}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="gmv"
                name={t('analytics.totalGmvVnd', 'Tổng GMV (VNĐ)')}
                stroke={adminDesignTokens.colors.primary}
                fillOpacity={1}
                fill="url(#colorGmv)"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name={t('analytics.platformCommissionVnd', 'Hoa Hồng Sàn (VNĐ)')}
                stroke={adminDesignTokens.colors.chartGreen}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
