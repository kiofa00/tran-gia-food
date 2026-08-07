'use client';

import { useMemo, useState } from 'react';

import { BankOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';

import {
  CommissionsStats,
  CommissionsTable,
  PageContainer,
  PageHeader,
  mapCommissionRecord,
  useCommissionsColumns,
  useCommissionsQuery,
} from '@/components';
import { useTranslation } from '@/providers/LanguageProvider';
import { CommissionRecord } from '@/types';

export default function CommissionsPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: rawCommissions, isLoading: loading } = useCommissionsQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    page,
    limit: pageSize,
  });

  const isPaginated =
    rawCommissions !== null &&
    typeof rawCommissions === 'object' &&
    !Array.isArray(rawCommissions) &&
    'data' in (rawCommissions as object);

  const rawList: Record<string, unknown>[] = useMemo(
    () =>
      isPaginated
        ? ((rawCommissions as { data: Record<string, unknown>[] }).data ?? [])
        : ((rawCommissions as Record<string, unknown>[]) ?? []),
    [isPaginated, rawCommissions],
  );

  const totalItems: number = isPaginated
    ? ((rawCommissions as { total: number }).total ?? 0)
    : rawList.length;

  const commissions: CommissionRecord[] = useMemo(
    () => rawList.map((item, idx) => mapCommissionRecord(item, idx)),
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

  const totalPlatformCommission = useMemo(
    () => commissions.reduce((sum, item) => sum + item.platformShare, 0),
    [commissions],
  );
  const totalRestaurantRevenue = useMemo(
    () => commissions.reduce((sum, item) => sum + item.restaurantShare, 0),
    [commissions],
  );
  const totalShipperDelivery = useMemo(
    () => commissions.reduce((sum, item) => sum + item.shipperShare, 0),
    [commissions],
  );

  const handleProcessPayout = () => {
    message.success(t('vouchers.toggleActiveSuccess', 'Đã quyết toán ví đối tác thành công!'));
  };

  const columns = useCommissionsColumns();

  return (
    <PageContainer>
      <PageHeader
        icon="💰"
        title={t('commissions.title', 'Đối Soát Hoa Hồng & Quản Lý Ví')}
        subtitle={t(
          'commissions.subtitle',
          'Theo dõi tỷ lệ chiết khấu sàn, số dư ví tài xế và đối soát doanh thu nhà hàng',
        )}
        action={
          <Button
            type="primary"
            icon={<BankOutlined />}
            size="large"
            onClick={handleProcessPayout}
            className="bg-green-600 font-semibold border-none"
          >
            {t('common.confirm', 'Duyệt Quyết Toán Ví')}
          </Button>
        }
      />

      <CommissionsStats
        loading={loading}
        totalPlatformCommission={totalPlatformCommission}
        totalRestaurantRevenue={totalRestaurantRevenue}
        totalShipperDelivery={totalShipperDelivery}
      />

      <CommissionsTable
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleFilterChange}
        commissions={commissions}
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
