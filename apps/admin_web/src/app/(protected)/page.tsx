'use client';

import { useState } from 'react';

import { ReloadOutlined } from '@ant-design/icons';
import { App, Button, Card } from 'antd';

import {
  DashboardMetrics,
  DashboardStats,
  DataTable,
  PageContainer,
  PageHeader,
  PendingShipperRecord,
  SearchFilterBox,
  useDashboardStatsQuery,
  usePendingShippersQuery,
  useShipperKycColumns,
} from '@/components';
import { DASHBOARD_SHIPPER_FILTER_OPTIONS } from '@/shared-config';
import { mapVehicleType } from '@/utils/formatters';

export default function AdminDashboardPage() {
  const { message } = App.useApp();
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

  const stats: DashboardStats = statsData || {
    totalUsers: 0,
    totalRestaurants: 0,
    totalShippers: 0,
    totalOrders: 0,
    totalPlatformRevenue: 0,
    totalFoodGmv: 0,
    totalShipGmv: 0,
  };

  const isPaginated =
    rawShippersData !== null &&
    typeof rawShippersData === 'object' &&
    !Array.isArray(rawShippersData) &&
    'data' in (rawShippersData as object);

  const rawList = isPaginated
    ? ((rawShippersData as { data: unknown[] }).data ?? [])
    : ((rawShippersData as unknown[]) ?? []);

  const totalItems: number = isPaginated
    ? ((rawShippersData as { total: number }).total ?? 0)
    : rawList.length;

  const pendingShippers: PendingShipperRecord[] = rawList.map((item: unknown, idx: number) => {
    const s = item as Record<string, unknown>;
    const rawStatus = (s.ekycStatus || s.kycStatus || s.status || 'PENDING')
      .toString()
      .toUpperCase();
    const normalizedStatus =
      rawStatus === 'VERIFIED' || rawStatus === 'APPROVED' ? 'APPROVED' : rawStatus;

    return {
      key: String(s.id || idx + 1),
      id: String(s.id || `S${idx + 1}`),
      name: (s.user as Record<string, string> | undefined)?.name || String(s.name || ''),
      phone: (s.user as Record<string, string> | undefined)?.phone || String(s.phone || ''),
      vehicle: mapVehicleType(String(s.vehicle || s.vehicleType || '')),
      plate: String(s.plate || s.licensePlate || ''),
      status: normalizedStatus,
      rawStatus,
    };
  });

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
    message.success('Đã cập nhật số liệu mới nhất!');
  };

  const columns = useShipperKycColumns();

  return (
    <PageContainer>
      <PageHeader
        icon="🍜"
        title="Tran Gia Food — Dashboard Quản Trị"
        subtitle="Tích hợp API Realtime theo dõi doanh thu, GMV & tài xế toàn quốc"
        action={
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            className="font-semibold"
          >
            Làm mới số liệu
          </Button>
        }
      />

      <DashboardMetrics stats={stats} loading={loading} />

      <SearchFilterBox
        searchPlaceholder="Tìm theo tên hoặc SĐT tài xế..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        filterLabel="Lọc trạng thái eKYC:"
        filterValue={statusFilter}
        onFilterChange={handleFilterChange}
        filterOptions={DASHBOARD_SHIPPER_FILTER_OPTIONS}
      />

      <Card
        title="📋 Danh Sách Shipper Chờ Duyệt eKYC"
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<PendingShipperRecord>
          rowKey="key"
          columns={columns}
          dataSource={pendingShippers}
          loading={loading}
          scroll={{ x: 1100 }}
          emptyDescription="Không có tài xế chờ duyệt eKYC"
          pagination={{
            current: page,
            pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài xế`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </PageContainer>
  );
}
