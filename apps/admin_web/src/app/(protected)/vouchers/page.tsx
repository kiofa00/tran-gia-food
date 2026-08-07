'use client';

import { useCallback, useMemo, useState } from 'react';

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
  mapVoucherRecord,
  useCreateVoucherMutation,
  useToggleVoucherMutation,
  useVoucherColumns,
  useVouchersQuery,
} from '@/components';
import { useTranslation } from '@/providers/LanguageProvider';
import { VOUCHER_STATUS_FILTER_OPTIONS } from '@/shared-config';

export default function VoucherManagementPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();

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

  const rawList: Record<string, unknown>[] = useMemo(
    () =>
      isPaginated
        ? ((rawVouchersData as { data: Record<string, unknown>[] }).data ?? [])
        : ((rawVouchersData as Record<string, unknown>[]) ?? []),
    [isPaginated, rawVouchersData],
  );

  const totalItems: number = isPaginated
    ? ((rawVouchersData as { total: number }).total ?? 0)
    : rawList.length;

  const vouchers: VoucherRecord[] = useMemo(
    () => rawList.map((item) => mapVoucherRecord(item, statusOverrides)),
    [rawList, statusOverrides],
  );

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

  const handleToggleActive = useCallback(
    (key: string, checked: boolean) => {
      setStatusOverrides((prev) => ({ ...prev, [key]: checked }));
      toggleVoucherMutation.mutate({ id: key, isActive: checked });
      const statusText = checked
        ? t('common.active', 'kích hoạt')
        : t('common.inactive', 'tạm dừng');

      message.success(
        t('vouchers.toggleActiveSuccess', 'Đã {status} mã giảm giá thành công!', {
          status: statusText,
        }),
      );
    },
    [message, t, toggleVoucherMutation],
  );

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
        message.success(
          t('vouchers.createSuccess', 'Tạo mã giảm giá {code} thành công!', {
            code: payload.code,
          }),
        );
      },
      onError: () => message.error(t('vouchers.createError', 'Không thể tạo mã giảm giá')),
    });
  };

  const columns = useVoucherColumns({ onToggleActive: handleToggleActive });

  return (
    <PageContainer>
      <PageHeader
        icon="🎟️"
        title={t('vouchers.title', 'Quản Lý Mã Giảm Giá & Khuyến Mãi')}
        subtitle={t(
          'vouchers.subtitle',
          'Tạo mới, thiết lập hạn mức và theo dõi hiệu quả các chương trình Voucher toàn sàn',
        )}
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 font-semibold"
          >
            {t('vouchers.createBtn', 'Tạo Mã Voucher Mới')}
          </Button>
        }
      />

      <SearchFilterBox
        searchPlaceholder={t(
          'vouchers.searchPlaceholder',
          'Tìm theo mã voucher (vd: TRANGIA50K)...',
        )}
        searchValue={search}
        onSearchChange={handleSearchChange}
        filterLabel={t('vouchers.filterStatusLabel', 'Lọc trạng thái:')}
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
