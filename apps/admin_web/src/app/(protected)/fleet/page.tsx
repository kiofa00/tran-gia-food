'use client';

import { useState } from 'react';

import { Card } from 'antd';

import {
  DataTable,
  FleetMap,
  PageContainer,
  PageHeader,
  SearchFilterBox,
  getFleetColumns,
  useFleetQuery,
} from '@/components';
import { FLEET_STATUS_FILTER_OPTIONS } from '@/shared-config';
import { ShipperRecord } from '@/types';

export default function LiveFleetMonitorPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: rawShippers, isLoading: loading } = useFleetQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    page,
    limit: pageSize,
  });

  const isPaginated =
    rawShippers !== null &&
    typeof rawShippers === 'object' &&
    !Array.isArray(rawShippers) &&
    'data' in (rawShippers as object);

  const rawList: Record<string, unknown>[] = isPaginated
    ? ((rawShippers as { data: Record<string, unknown>[] }).data ?? [])
    : ((rawShippers as Record<string, unknown>[]) ?? []);

  const totalItems: number = isPaginated
    ? ((rawShippers as { total: number }).total ?? 0)
    : rawList.length;

  const shippers: ShipperRecord[] = rawList.map((item: Record<string, unknown>, idx: number) => ({
    id: String(item.id || item.key || idx + 1),
    key: String(item.id || item.key || idx + 1),
    name: String(item.name || ''),
    phone: String(item.phone || ''),
    vehicle: String(item.vehicle || 'MOTORBIKE'),
    plate: String(item.plate || ''),
    lat: Number(item.lat) || 0,
    lng: Number(item.lng) || 0,
    status: String(item.status || 'OFFLINE'),
    ekycStatus: String(item.ekycStatus || 'PENDING'),
    rating: Number(item.rating) || 5.0,
  }));

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const activeShippers = shippers.filter((s) => s.status !== 'OFFLINE');
  const columns = getFleetColumns();

  return (
    <PageContainer>
      <PageHeader
        icon="🗺️"
        title="Live Fleet Monitor — Bản Đồ Tài Xế Realtime"
        subtitle="Theo dõi vị trí GPS & trạng thái hoạt động của tất cả tài xế trên hệ thống"
      />

      <Card variant="borderless" className="!mb-6 rounded-xl shadow-xs">
        <FleetMap activeShippers={activeShippers} />
      </Card>

      <SearchFilterBox
        searchPlaceholder="Tìm theo tên hoặc SĐT tài xế..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        filterLabel="Lọc trạng thái:"
        filterValue={statusFilter}
        onFilterChange={handleFilterChange}
        filterOptions={FLEET_STATUS_FILTER_OPTIONS}
      />

      <Card
        title={`⚡ Danh Sách Tài Xế Đang Online (${totalItems})`}
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<ShipperRecord>
          rowKey="key"
          columns={columns}
          dataSource={shippers}
          loading={loading}
          scroll={{ x: 1060 }}
          emptyDescription="Chưa có tài xế trực tuyến"
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
