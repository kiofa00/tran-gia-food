'use client';

import { useCallback, useMemo, useState } from 'react';

import { App, Card, Modal, Select, Space, Typography } from 'antd';

import {
  DataTable,
  PageContainer,
  PageHeader,
  SearchFilterBox,
  UserDetailModal,
  UserMetrics,
  UserRecord,
  getUserColumns,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from '@/components';
import { useUserFilterOptions } from '@/hooks';
import { useTranslation } from '@/providers/LanguageProvider';

const { Text } = Typography;

export default function UsersManagementPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: rawData, isLoading } = useUsersQuery({
    search: search || undefined,
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
    userStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const updateStatusMutation = useUpdateUserStatusMutation();

  const isPaginated =
    rawData !== null &&
    typeof rawData === 'object' &&
    !Array.isArray(rawData) &&
    'data' in (rawData as object);

  const userList: UserRecord[] = isPaginated
    ? ((rawData as { data: UserRecord[] }).data ?? [])
    : ((rawData as UserRecord[]) ?? []);

  const totalUsersCount = userList.length;
  const customersCount = userList.filter((u) => u.role === 'CUSTOMER').length;
  const restaurantsCount = userList.filter((u) => u.role === 'RESTAURANT_OWNER').length;
  const shippersCount = userList.filter((u) => u.role === 'SHIPPER').length;

  const handleToggleStatus = useCallback(
    (record: UserRecord) => {
      const nextStatus = record.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const actionText =
        nextStatus === 'SUSPENDED' ? t('users.lock', 'khóa') : t('users.unlock', 'mở khóa');

      Modal.confirm({
        title: t('users.confirmToggleTitle', 'Xác nhận {action} tài khoản?', {
          action: actionText,
        }),
        content: t(
          'users.confirmToggleContent',
          'Bạn có chắc chắn muốn {action} tài khoản của "{name}" ({phone})?',
          { action: actionText, name: record.name, phone: record.phone },
        ),
        okText: t('common.confirm', 'Xác nhận'),
        cancelText: t('common.cancel', 'Hủy'),
        okButtonProps: { danger: nextStatus === 'SUSPENDED' },
        onOk: () => {
          updateStatusMutation.mutate(
            { id: record.id, status: nextStatus },
            {
              onSuccess: () => {
                message.success(
                  t('users.actionSuccess', 'Đã {action} tài khoản thành công!', {
                    action: actionText,
                  }),
                );
              },
              onError: () => {
                message.error(t('common.errorTryAgain', 'Thao tác thất bại, vui lòng thử lại.'));
              },
            },
          );
        },
      });
    },
    [message, t, updateStatusMutation],
  );

  const { roleFilterOptions, statusFilterOptions } = useUserFilterOptions();

  const columns = useMemo(
    () =>
      getUserColumns({
        t,
        onViewDetail: (record) => {
          setSelectedUser(record);
          setDetailModalOpen(true);
        },
        onToggleStatus: handleToggleStatus,
      }),
    [t, handleToggleStatus],
  );

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        <PageHeader
          icon="👥"
          title={t('users.title', 'Quản Lý Người Dùng Hệ Thống')}
          subtitle={t(
            'users.subtitle',
            'Quản lý danh sách tài khoản Khách hàng, Quán ăn, Tài xế và Quản trị viên',
          )}
        />

        <UserMetrics
          totalUsersCount={totalUsersCount}
          customersCount={customersCount}
          restaurantsCount={restaurantsCount}
          shippersCount={shippersCount}
        />

        <Card variant="borderless" className="rounded-xl shadow-xs">
          <Space direction="vertical" className="w-full" size="middle">
            <SearchFilterBox
              searchPlaceholder={t(
                'users.searchPlaceholder',
                'Tìm kiếm theo tên, SĐT hoặc email...',
              )}
              searchValue={search}
              onSearchChange={setSearch}
              filterLabel={t('users.filterRole', 'Lọc Vai Trò:')}
              filterValue={roleFilter}
              onFilterChange={setRoleFilter}
              filterOptions={roleFilterOptions}
              extraAction={
                <div className="flex items-center gap-1.5 shrink-0">
                  <Text type="secondary">{t('users.filterStatus', 'Lọc Trạng Thái:')}</Text>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="flex-1 sm:flex-none sm:min-w-36"
                  >
                    {statusFilterOptions.map((opt) => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              }
            />

            <DataTable<UserRecord>
              rowKey="id"
              dataSource={userList}
              columns={columns}
              loading={isLoading}
              emptyDescription={t('users.emptyDescription', 'Không tìm thấy người dùng phù hợp')}
            />
          </Space>
        </Card>
      </Space>

      <UserDetailModal
        open={detailModalOpen}
        user={selectedUser}
        onClose={() => setDetailModalOpen(false)}
      />
    </PageContainer>
  );
}
