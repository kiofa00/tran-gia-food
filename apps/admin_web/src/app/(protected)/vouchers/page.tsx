'use client';

import { useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';

import {
  CreateVoucherFormValues,
  PageContainer,
  PageHeader,
  SearchFilterBox,
  VoucherCreateModal,
  VoucherRecord,
  VoucherTable,
  getVoucherColumns,
  useCreateVoucherMutation,
  useToggleVoucherMutation,
  useVouchersQuery,
} from '@/components';
import { VOUCHER_STATUS_FILTER_OPTIONS } from '@/shared-config';

export default function VoucherManagementPage() {
  const { message } = App.useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: rawVouchersData, isLoading: loading } = useVouchersQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter.toLowerCase() : undefined,
    page,
    limit: pageSize,
  });

  const isPaginated =
    rawVouchersData !== null &&
    typeof rawVouchersData === 'object' &&
    !Array.isArray(rawVouchersData) &&
    'data' in (rawVouchersData as object);

  const rawList: Record<string, unknown>[] = isPaginated
    ? ((rawVouchersData as { data: Record<string, unknown>[] }).data ?? [])
    : ((rawVouchersData as Record<string, unknown>[]) ?? []);

  const totalItems: number = isPaginated
    ? ((rawVouchersData as { total: number }).total ?? 0)
    : rawList.length;

  const vouchers: VoucherRecord[] = rawList.map((item: Record<string, unknown>) => {
    const itemKey = (item.id || item.key) as string;
    let isActive = true;

    if (statusOverrides[itemKey] !== undefined) {
      isActive = statusOverrides[itemKey];
    } else if (item.isActive !== undefined) {
      isActive = Boolean(item.isActive);
    }

    return {
      id: String(item.id || item.key || ''),
      key: itemKey,
      code: String(item.code || ''),
      type: String(item.type || 'Platform'),
      discountType: (String(item.discountType || 'fixed') === 'percent' ? 'percent' : 'fixed') as
        'percent' | 'fixed',
      discountValue: Number(item.discountValue) || 0,
      minOrderValue: Number(item.minOrderValue) || 0,
      validFrom: String(item.validFrom || ''),
      validTo: String(item.validTo || ''),
      usedCount: Number(item.usedCount) || 0,
      totalLimit: Number(item.totalLimit) || 0,
      isActive,
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

  const createVoucherMutation = useCreateVoucherMutation();
  const toggleVoucherMutation = useToggleVoucherMutation();

  const handleToggleActive = (key: string, checked: boolean) => {
    setStatusOverrides((prev) => ({ ...prev, [key]: checked }));
    toggleVoucherMutation.mutate({ id: key, isActive: checked });
    message.success(`Đã ${checked ? 'kích hoạt' : 'tạm dừng'} mã giảm giá thành công!`);
  };

  const handleCreateVoucher = (values: CreateVoucherFormValues) => {
    const payload = {
      code: values.code.toUpperCase(),
      type: values.type || 'Platform',
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrderValue: values.minOrderValue || 0,
      totalLimit: values.totalLimit || 100,
      validFrom: values.validDates
        ? (values.validDates[0]?.format('YYYY-MM-DD') ?? new Date().toISOString().split('T')[0]!)
        : new Date().toISOString().split('T')[0]!,
      validTo: values.validDates
        ? (values.validDates[1]?.format('YYYY-MM-DD') ??
          new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]!)
        : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]!,
    };

    createVoucherMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        message.success(`Tạo mã giảm giá ${payload.code} thành công!`);
      },
      onError: () => message.error('Không thể tạo mã giảm giá'),
    });
  };

  const columns = getVoucherColumns({ onToggleActive: handleToggleActive });

  return (
    <PageContainer>
      <PageHeader
        icon="🎟️"
        title="Quản Lý Mã Giảm Giá & Khuyến Mãi"
        subtitle="Tạo mới, thiết lập hạn mức và theo dõi hiệu quả các chương trình Voucher toàn sàn"
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 font-semibold"
          >
            Tạo Mã Voucher Mới
          </Button>
        }
      />

      <SearchFilterBox
        searchPlaceholder="Tìm theo mã voucher (vd: TRANGIA50K)..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        filterLabel="Lọc trạng thái:"
        filterValue={statusFilter}
        onFilterChange={handleFilterChange}
        filterOptions={VOUCHER_STATUS_FILTER_OPTIONS}
      />

      <VoucherTable
        vouchers={vouchers}
        loading={loading}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
      />

      <VoucherCreateModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleCreateVoucher}
        confirmLoading={createVoucherMutation.isPending}
      />
    </PageContainer>
  );
}
