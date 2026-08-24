'use client';

import { useCallback, useMemo, useState } from 'react';

import { App, Card, Modal, Space, Typography } from 'antd';

import {
  DataTable,
  PageContainer,
  PageHeader,
  RestaurantRecord,
  SearchFilterBox,
  getRestaurantColumns,
  mapRestaurantRecord,
  useApproveRestaurantMutation,
  useRestaurantsQuery,
  useSuspendRestaurantMutation,
} from '@/components';
import { useLocale } from '@/hooks';

const { Text } = Typography;

export default function RestaurantsManagementPage() {
  const { message } = App.useApp();
  const { t } = useLocale();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawData, isLoading } = useRestaurantsQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const approveMutation = useApproveRestaurantMutation();
  const suspendMutation = useSuspendRestaurantMutation();

  const restaurants: RestaurantRecord[] = useMemo(() => {
    const isPaginated =
      rawData !== null &&
      typeof rawData === 'object' &&
      !Array.isArray(rawData) &&
      'data' in (rawData as object);
    const list: Record<string, unknown>[] = isPaginated
      ? ((rawData as { data: Record<string, unknown>[] }).data ?? [])
      : ((rawData as Record<string, unknown>[]) ?? []);

    return list.map(mapRestaurantRecord);
  }, [rawData]);

  const pendingCount = restaurants.filter((r) => r.status === 'PENDING').length;
  const approvedCount = restaurants.filter((r) => r.status === 'APPROVED').length;
  const suspendedCount = restaurants.filter((r) => r.status === 'SUSPENDED').length;

  const handleApprove = useCallback(
    (record: RestaurantRecord) => {
      Modal.confirm({
        title: t('restaurants.approveConfirmTitle', 'Xác nhận duyệt nhà hàng'),
        content: t(
          'restaurants.approveConfirmContent',
          'Bạn có chắc muốn phê duyệt mở quán cho "{name}" không?',
          { name: record.name },
        ),
        okText: t('common.confirm', 'Phê Duyệt'),
        cancelText: t('common.cancel', 'Hủy'),
        okButtonProps: { className: 'bg-green-600' },
        onOk: () =>
          approveMutation.mutate(record.id, {
            onSuccess: () => message.success(t('common.success', 'Đã duyệt nhà hàng thành công!')),
            onError: () => message.error(t('common.errorTryAgain', 'Thao tác thất bại.')),
          }),
      });
    },
    [approveMutation, message, t],
  );

  const handleSuspend = useCallback(
    (record: RestaurantRecord) => {
      Modal.confirm({
        title: t('restaurants.suspendConfirmTitle', 'Đình chỉ hoạt động'),
        content: t(
          'restaurants.suspendConfirmContent',
          'Bạn có chắc muốn tạm đình chỉ hoạt động quán "{name}" không?',
          { name: record.name },
        ),
        okText: t('restaurants.suspend', 'Đình Chỉ Quán'),
        cancelText: t('common.cancel', 'Hủy'),
        okButtonProps: { danger: true },
        onOk: () =>
          suspendMutation.mutate(
            {
              id: record.id,
              reason: t('restaurants.suspendReasonDefault', 'Vi phạm chính sách nền tảng'),
            },
            {
              onSuccess: () => message.success(t('common.success', 'Đã đình chỉ nhà hàng.')),
              onError: () => message.error(t('common.errorTryAgain', 'Thao tác thất bại.')),
            },
          ),
      });
    },
    [suspendMutation, message, t],
  );

  const columns = useMemo(
    () =>
      getRestaurantColumns({
        onApprove: handleApprove,
        onSuspend: handleSuspend,
        onView: (_r) => undefined,
      }),
    [handleApprove, handleSuspend],
  );

  const filterOptions = useMemo(
    () => [
      { value: 'ALL', label: t('common.all', 'Tất cả') },
      { value: 'PENDING', label: t('restaurants.pending', 'Chờ duyệt') },
      { value: 'APPROVED', label: t('restaurants.active', 'Đang hoạt động') },
      { value: 'SUSPENDED', label: t('restaurants.suspend', 'Bị đình chỉ') },
    ],
    [t],
  );

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        <PageHeader
          icon="🍽️"
          title={t('restaurants.title', 'Quản Lý Nhà Hàng')}
          subtitle={t(
            'restaurants.subtitle',
            'Duyệt đăng ký, theo dõi và quản lý tất cả nhà hàng trên nền tảng',
          )}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: t('restaurants.pending', 'Chờ Duyệt'),
              value: pendingCount,
              color: 'text-orange-500',
            },
            {
              label: t('restaurants.active', 'Đang Hoạt Động'),
              value: approvedCount,
              color: 'text-green-600',
            },
            {
              label: t('restaurants.suspend', 'Bị Đình Chỉ'),
              value: suspendedCount,
              color: 'text-red-500',
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              variant="borderless"
              className="rounded-xl shadow-xs text-center"
            >
              <Text className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</Text>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </Card>
          ))}
        </div>

        <Card variant="borderless" className="rounded-xl shadow-xs">
          <Space direction="vertical" className="w-full" size="middle">
            <SearchFilterBox
              searchPlaceholder={t('common.search', 'Tìm theo tên quán, địa chỉ, chủ sở hữu...')}
              searchValue={search}
              onSearchChange={setSearch}
              filterLabel={t('common.status', 'Lọc Trạng Thái:')}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterOptions={filterOptions}
            />

            <DataTable<RestaurantRecord>
              rowKey="id"
              dataSource={restaurants}
              columns={columns}
              loading={isLoading}
              emptyDescription={t('common.noData', 'Không tìm thấy nhà hàng phù hợp')}
            />
          </Space>
        </Card>
      </Space>
    </PageContainer>
  );
}
