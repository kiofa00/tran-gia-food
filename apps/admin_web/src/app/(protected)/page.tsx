'use client';

import { useMemo } from 'react';

import { ReloadOutlined } from '@ant-design/icons';
import { App, Button, Col, Row } from 'antd';

import {
  DashboardActionAlerts,
  DashboardMetrics,
  DashboardQuickLinks,
  DashboardStats,
  PageContainer,
  PageHeader,
  PaymentSplitChart,
  ProcessedTrendItem,
  RevenueTrendChart,
  useAnalyticsQuery,
  useDashboardStatsQuery,
} from '@/components';
import { useLocale } from '@/hooks';
import { PaymentMethodItem, RevenueTrendItem } from '@/types';

export default function AdminDashboardPage() {
  const { message } = App.useApp();
  const { t } = useLocale();

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStatsQuery();

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalyticsQuery('7d');

  const loading = statsLoading || analyticsLoading;

  const stats: DashboardStats = useMemo(
    () =>
      statsData || {
        totalUsers: 0,
        totalRestaurants: 0,
        totalShippers: 0,
        totalOrders: 0,
        totalPlatformRevenue: 0,
        totalFoodGmv: 0,
        totalShipGmv: 0,
      },
    [statsData],
  );

  const trendData = useMemo<ProcessedTrendItem[]>(
    () =>
      (analyticsData?.revenueTrend || []).map((item: RevenueTrendItem) => ({
        date: item.date || item.month || '',
        gmv: (item.gmv || 0) * (item.gmv > 10000 ? 1 : 100000),
        revenue: (item.platformRevenue || 0) * (item.platformRevenue > 10000 ? 1 : 100000),
        orders: item.orders || 0,
      })),
    [analyticsData?.revenueTrend],
  );

  const paymentData: PaymentMethodItem[] = useMemo(
    () => analyticsData?.paymentMethods || analyticsData?.paymentSplit || [],
    [analyticsData?.paymentMethods, analyticsData?.paymentSplit],
  );

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchAnalytics()]);
    message.success(t('dashboard.refreshedSuccess', 'Đã cập nhật số liệu mới nhất!'));
  };

  return (
    <PageContainer>
      <PageHeader
        icon="🍜"
        title={t('dashboard.title', 'Tran Gia Food — Dashboard Quản Trị')}
        subtitle={t(
          'dashboard.subtitle',
          'Tích hợp API Realtime theo dõi doanh thu, GMV & tài xế toàn quốc',
        )}
        action={
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            className="font-semibold"
          >
            {t('dashboard.refreshBtn', 'Làm mới số liệu')}
          </Button>
        }
      />

      {/* KPI Financial & Scale Metrics */}
      <DashboardMetrics stats={stats} loading={statsLoading} />

      {/* Actionable Alerts & Operations Status */}
      <DashboardActionAlerts />

      {/* Mini Analytics: Revenue & Payment Split Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={15}>
          <RevenueTrendChart trendData={trendData} loading={analyticsLoading} />
        </Col>
        <Col xs={24} lg={9}>
          <PaymentSplitChart paymentData={paymentData} loading={analyticsLoading} />
        </Col>
      </Row>

      {/* Quick Module Navigation Hub */}
      <DashboardQuickLinks />
    </PageContainer>
  );
}
