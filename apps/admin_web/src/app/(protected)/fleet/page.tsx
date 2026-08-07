'use client';

import { useMemo, useState } from 'react';

import { Card } from 'antd';

import {
  FleetMap,
  FleetTable,
  PageContainer,
  PageHeader,
  mapShipperRecord,
  useFleetColumns,
  useFleetQuery,
} from '@/components';
import { useTranslation } from '@/providers/LanguageProvider';
import { ShipperRecord } from '@/types';

export default function LiveFleetMonitorPage() {
  const { t } = useTranslation();
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

  const rawList: Record<string, unknown>[] = useMemo(
    () =>
      isPaginated
        ? ((rawShippers as { data: Record<string, unknown>[] }).data ?? [])
        : ((rawShippers as Record<string, unknown>[]) ?? []),
    [isPaginated, rawShippers],
  );

  const totalItems: number = isPaginated
    ? ((rawShippers as { total: number }).total ?? 0)
    : rawList.length;

  const shippers: ShipperRecord[] = useMemo(
    () => rawList.map((item, idx) => mapShipperRecord(item, idx)),
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

  const activeShippers = useMemo(() => shippers.filter((s) => s.status !== 'OFFLINE'), [shippers]);
  const columns = useFleetColumns();

  return (
    <PageContainer>
      <PageHeader
        icon="🗺️"
        title={t('fleet.title', 'Live Fleet Monitor — Bản Đồ Tài Xế Realtime')}
        subtitle={t(
          'fleet.subtitle',
          'Theo dõi vị trí GPS & trạng thái hoạt động của tất cả tài xế trên hệ thống',
        )}
      />

      <Card variant="borderless" className="!mb-6 rounded-xl shadow-xs">
        <FleetMap activeShippers={activeShippers} />
      </Card>

      <FleetTable
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleFilterChange}
        shippers={shippers}
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
