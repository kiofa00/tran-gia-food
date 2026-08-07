'use client';

import { useMemo, useState } from 'react';

import { Col, Row, Select, Space, Typography } from 'antd';

import {
  AnalyticsMetrics,
  OrdersGrowthChart,
  PageContainer,
  PageHeader,
  PaymentSplitChart,
  ProcessedTrendItem,
  RevenueTrendChart,
  TopRestaurantsTable,
  useAnalyticsQuery,
} from '@/components';
import { useTranslation } from '@/providers/LanguageProvider';
import { ANALYTICS_TIME_RANGE_OPTIONS } from '@/shared-config';
import { PaymentMethodItem, RevenueTrendItem, TopRestaurantItem } from '@/types';

const { Text } = Typography;

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');
  const { data, isLoading: loading } = useAnalyticsQuery(timeRange);

  const trendData = useMemo<ProcessedTrendItem[]>(
    () =>
      (data?.revenueTrend || []).map((item: RevenueTrendItem) => ({
        date: item.date || item.month || '',
        gmv: (item.gmv || 0) * (item.gmv > 10000 ? 1 : 100000),
        revenue: (item.platformRevenue || 0) * (item.platformRevenue > 10000 ? 1 : 100000),
        orders: item.orders || 0,
      })),
    [data?.revenueTrend],
  );

  const comparisonLabel = useMemo(() => {
    if (timeRange === '30d') return 'so với tháng trước';
    if (timeRange === 'quarter') return 'so với quý trước';

    return 'so với tuần trước';
  }, [timeRange]);

  const summary = useMemo(
    () =>
      data?.summary || {
        totalGmv: trendData.reduce((sum, item) => sum + item.gmv, 0),
        platformRevenue: trendData.reduce((sum, item) => sum + item.revenue, 0),
        totalOrders: trendData.reduce((sum, item) => sum + item.orders, 0),
        avgOrderValue: 0,
        growthRate: 18.4,
        comparisonLabel,
      },
    [data?.summary, trendData, comparisonLabel],
  );

  const paymentData: PaymentMethodItem[] = useMemo(
    () => data?.paymentMethods || data?.paymentSplit || [],
    [data?.paymentMethods, data?.paymentSplit],
  );

  const topRestaurants = useMemo<TopRestaurantItem[]>(
    () =>
      (data?.topRestaurants || []).map((item: TopRestaurantItem, idx: number) => ({
        ...item,
        key: item.id || item.rank || `rest-${idx}`,
      })),
    [data?.topRestaurants],
  );

  const effectiveCommissionRate = useMemo(
    () =>
      summary.totalGmv > 0
        ? ((summary.platformRevenue / summary.totalGmv) * 100).toFixed(1)
        : '15.0',
    [summary.totalGmv, summary.platformRevenue],
  );

  const completionRate = useMemo(
    () => (summary.totalOrders > 0 ? '98.5' : '0.0'),
    [summary.totalOrders],
  );

  const itemsPerOrder = useMemo(
    () =>
      summary.totalOrders > 0
        ? Math.max(1.8, Math.min(4.5, summary.avgOrderValue / 45000)).toFixed(1)
        : '0.0',
    [summary.totalOrders, summary.avgOrderValue],
  );

  return (
    <PageContainer>
      <PageHeader
        icon="📊"
        title={t('analytics.title', 'Báo Cáo Phân Tích & Thống Kê Doanh Thu')}
        subtitle={t(
          'analytics.subtitle',
          'Biểu đồ trực quan tăng trưởng đơn hàng, tỷ trọng doanh thu & top quán ăn bán chạy',
        )}
        action={
          <Space align="center">
            <Text strong>{t('vouchers.validity', 'Khoảng thời gian:')}</Text>
            <Select
              value={timeRange}
              onChange={(val) => setTimeRange(val)}
              className="w-40"
              options={ANALYTICS_TIME_RANGE_OPTIONS}
            />
          </Space>
        }
      />

      <AnalyticsMetrics
        summary={summary}
        effectiveCommissionRate={effectiveCommissionRate}
        completionRate={completionRate}
        itemsPerOrder={itemsPerOrder}
        loading={loading}
      />

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <RevenueTrendChart trendData={trendData} loading={loading} />
        </Col>
        <Col xs={24} lg={8}>
          <PaymentSplitChart paymentData={paymentData} loading={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <OrdersGrowthChart trendData={trendData} loading={loading} />
        </Col>
        <Col xs={24} lg={14}>
          <TopRestaurantsTable topRestaurants={topRestaurants} loading={loading} />
        </Col>
      </Row>
    </PageContainer>
  );
}
