'use client';

import { useMemo, useState } from 'react';

import { ReloadOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';

import {
  DashboardMetrics,
  DashboardStats,
  PageContainer,
  PageHeader,
  PendingShipperRecord,
  PendingShipperTable,
  mapPendingShipperRecord,
  useDashboardStatsQuery,
  usePendingShippersQuery,
  useShipperKycColumns,
} from '@/components';
import { useTranslation } from '@/providers/LanguageProvider';

export default function AdminDashboardPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStatsQuery();
  const {
    data: rawShippersData,
    isLoading: shippersLoading,
    refetch: refetchShippers,
  } = usePendingShippersQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    page,
    limit: pageSize,
  });

  const loading = statsLoading || shippersLoading;

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

  const isPaginated =
    rawShippersData !== null &&
    typeof rawShippersData === 'object' &&
    !Array.isArray(rawShippersData) &&
    'data' in (rawShippersData as object);

  const rawList = useMemo(
    () =>
      isPaginated
        ? ((rawShippersData as { data: unknown[] }).data ?? [])
        : ((rawShippersData as unknown[]) ?? []),
    [isPaginated, rawShippersData],
  );

  const totalItems: number = isPaginated
    ? ((rawShippersData as { total: number }).total ?? 0)
    : rawList.length;

  const pendingShippers: PendingShipperRecord[] = useMemo(
    () => rawList.map((item, idx) => mapPendingShipperRecord(item, idx)),
    [rawList],
  );

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };
  const handleRefresh = () => {
    refetchStats();
    refetchShippers();
    message.success(t('dashboard.refreshedSuccess', 'Đã cập nhật số liệu mới nhất!'));
  };

  const columns = useShipperKycColumns();

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

      <DashboardMetrics stats={stats} loading={loading} />

      <PendingShipperTable
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleFilterChange}
        pendingShippers={pendingShippers}
        columns={columns}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
      />
    </PageContainer>
  );
}
