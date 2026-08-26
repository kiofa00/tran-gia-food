'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { BankOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button, Space } from 'antd';

import {
  CommissionsStats,
  CommissionsTable,
  PageContainer,
  PageHeader,
  mapCommissionRecord,
  useCommissionsColumns,
  useCommissionsQuery,
} from '@/components';
import { useLocale } from '@/hooks';
import { ADMIN_ROUTES, COMMISSION_QUERY_KEYS } from '@/shared-config';
import { CommissionRecord } from '@/types';

export default function CommissionsPage() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const queryClient = useQueryClient();

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

  const filteredCommissions = useMemo(() => {
    if (statusFilter === 'ALL') return commissions;

    return commissions.filter((c) => c.status === statusFilter);
  }, [commissions, statusFilter]);

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

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    message.success(t('dashboard.refreshedSuccess', 'Đã cập nhật số liệu mới nhất!'));
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
          <Space>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              className="font-semibold"
            >
              {t('dashboard.refreshBtn', 'Làm mới số liệu')}
            </Button>
            <Link href={ADMIN_ROUTES.PAYOUTS} passHref>
              <Button
                type="primary"
                icon={<BankOutlined />}
                className="bg-green-600 font-semibold border-none"
              >
                {t('commissions.goToPayouts', 'Quản Lý Giải Ngân')}
              </Button>
            </Link>
          </Space>
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
        commissions={filteredCommissions}
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
