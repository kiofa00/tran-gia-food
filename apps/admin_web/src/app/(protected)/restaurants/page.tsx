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
import { RESTAURANT_STATUS_FILTER_OPTIONS } from '@/shared-config';

const { Text } = Typography;

export default function RestaurantsManagementPage() {
  const { message } = App.useApp();

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
        title: 'Duyệt nhà hàng?',
        content: `Xác nhận duyệt "${record.name}" tham gia nền tảng?`,
        okText: 'Duyệt',
        onOk: () =>
          approveMutation.mutate(record.id, {
            onSuccess: () => message.success('Đã duyệt nhà hàng thành công!'),
            onError: () => message.error('Thao tác thất bại.'),
          }),
      });
    },
    [approveMutation, message],
  );

  const handleSuspend = useCallback(
    (record: RestaurantRecord) => {
      Modal.confirm({
        title: 'Đình chỉ nhà hàng?',
        content: `Xác nhận đình chỉ hoạt động của "${record.name}"?`,
        okText: 'Đình Chỉ',
        okButtonProps: { danger: true },
        onOk: () =>
          suspendMutation.mutate(
            { id: record.id, reason: 'Vi phạm điều khoản sử dụng' },
            {
              onSuccess: () => message.success('Đã đình chỉ nhà hàng.'),
              onError: () => message.error('Thao tác thất bại.'),
            },
          ),
      });
    },
    [suspendMutation, message],
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

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        <PageHeader
          icon="🍽️"
          title="Quản Lý Nhà Hàng"
          subtitle="Duyệt đăng ký, theo dõi và quản lý tất cả nhà hàng trên nền tảng"
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Chờ Duyệt', value: pendingCount, color: 'text-orange-500' },
            { label: 'Đang Hoạt Động', value: approvedCount, color: 'text-green-600' },
            { label: 'Bị Đình Chỉ', value: suspendedCount, color: 'text-red-500' },
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
              searchPlaceholder="Tìm theo tên quán, địa chỉ, chủ sở hữu..."
              searchValue={search}
              onSearchChange={setSearch}
              filterLabel="Lọc Trạng Thái:"
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterOptions={RESTAURANT_STATUS_FILTER_OPTIONS}
            />

            <DataTable<RestaurantRecord>
              rowKey="id"
              dataSource={restaurants}
              columns={columns}
              loading={isLoading}
              emptyDescription="Không tìm thấy nhà hàng phù hợp"
            />
          </Space>
        </Card>
      </Space>
    </PageContainer>
  );
}
