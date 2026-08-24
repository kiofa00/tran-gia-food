'use client';

import { useCallback, useMemo, useState } from 'react';

import { App, Button, Card, Modal, Space, Typography } from 'antd';

import {
  DataTable,
  PageContainer,
  PageHeader,
  PayoutRecord,
  SearchFilterBox,
  getPayoutColumns,
  mapPayoutRecord,
  usePayoutsQuery,
  useProcessPayoutMutation,
  useRejectPayoutMutation,
} from '@/components';
import { useLocale } from '@/hooks';
import { convertToCsv, downloadCsv } from '@/utils';

const { Text } = Typography;

export default function PayoutsManagementPage() {
  const { message } = App.useApp();
  const { t } = useLocale();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawData, isLoading } = usePayoutsQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const processMutation = useProcessPayoutMutation();
  const rejectMutation = useRejectPayoutMutation();

  const payouts: PayoutRecord[] = useMemo(() => {
    const isPaginated =
      rawData !== null &&
      typeof rawData === 'object' &&
      !Array.isArray(rawData) &&
      'data' in (rawData as object);
    const list: Record<string, unknown>[] = isPaginated
      ? ((rawData as { data: Record<string, unknown>[] }).data ?? [])
      : ((rawData as Record<string, unknown>[]) ?? []);

    return list.map(mapPayoutRecord);
  }, [rawData]);

  const pendingAmount = payouts
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, p) => acc + p.amount, 0);
  const processedCount = payouts.filter((p) => p.status === 'PROCESSED').length;
  const pendingCount = payouts.filter((p) => p.status === 'PENDING').length;

  const handleProcess = useCallback(
    (record: PayoutRecord) => {
      Modal.confirm({
        title: t('payouts.process', 'Xác nhận giải ngân?'),
        content: t('payouts.processConfirmContent', 'Giải ngân {amount}đ cho "{name}"?', {
          amount: record.amount.toLocaleString('vi-VN'),
          name: record.restaurantName,
        }),
        okText: t('payouts.process', 'Giải Ngân'),
        cancelText: t('common.cancel', 'Hủy'),
        onOk: () =>
          processMutation.mutate(record.id, {
            onSuccess: () => message.success(t('common.success', 'Đã giải ngân thành công!')),
            onError: () => message.error(t('common.errorTryAgain', 'Thao tác thất bại.')),
          }),
      });
    },
    [processMutation, message, t],
  );

  const handleReject = useCallback(
    (record: PayoutRecord) => {
      Modal.confirm({
        title: t('payouts.reject', 'Từ chối giải ngân?'),
        content: t('payouts.rejectConfirmContent', 'Từ chối yêu cầu giải ngân của "{name}"?', {
          name: record.restaurantName,
        }),
        okText: t('payouts.reject', 'Từ Chối'),
        cancelText: t('common.cancel', 'Hủy'),
        okButtonProps: { danger: true },
        onOk: () =>
          rejectMutation.mutate(
            {
              payoutId: record.id,
              reason: t('payouts.invalidInfoReason', 'Thông tin không hợp lệ'),
            },
            {
              onSuccess: () =>
                message.success(t('common.success', 'Đã từ chối yêu cầu giải ngân.')),
              onError: () => message.error(t('common.errorTryAgain', 'Thao tác thất bại.')),
            },
          ),
      });
    },
    [rejectMutation, message, t],
  );

  const handleExportCsv = useCallback(() => {
    if (payouts.length === 0) {
      message.warning(t('payouts.emptyDescription', 'Không có dữ liệu để xuất file'));

      return;
    }

    const csvContent = convertToCsv(payouts, [
      { header: 'Mã Yêu Cầu', key: 'id' },
      { header: 'Đối Tác / Quán', key: 'restaurantName' },
      {
        header: 'Số Tiền (VNĐ)',
        key: (p) => p.amount,
      },
      { header: 'Trạng Thái', key: 'status' },
      { header: 'Kỳ Thanh Toán', key: 'period' },
      { header: 'Ngày Tạo', key: 'createdAt' },
    ]);

    const filename = `sao_ke_giai_ngan_${new Date().toISOString().slice(0, 10)}.csv`;

    downloadCsv(csvContent, filename);
    message.success(
      t('payouts.exportCsvSuccess', 'Đã xuất {count} bản ghi sao kê ra file CSV', {
        count: payouts.length,
      }),
    );
  }, [payouts, message, t]);

  const columns = useMemo(
    () => getPayoutColumns({ onProcess: handleProcess, onReject: handleReject }),
    [handleProcess, handleReject],
  );

  const filterOptions = useMemo(
    () => [
      { value: 'ALL', label: t('common.all', 'Tất cả trạng thái') },
      { value: 'PENDING', label: t('payouts.statusPending', 'Chờ giải ngân') },
      { value: 'PROCESSED', label: t('payouts.statusCompleted', 'Đã giải ngân') },
      { value: 'REJECTED', label: t('payouts.statusFailed', 'Bị từ chối') },
    ],
    [t],
  );

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        <PageHeader
          icon="💰"
          title={t('payouts.title', 'Quản Lý Giải Ngân')}
          subtitle={t('payouts.subtitle', 'Xử lý các yêu cầu thanh toán cho nhà hàng và tài xế')}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: t('payouts.statusPending', 'Chờ Giải Ngân'),
              value: `${pendingAmount.toLocaleString('vi-VN')}đ`,
              color: 'text-orange-500',
              sub: `${pendingCount} yêu cầu`,
            },
            {
              label: t('payouts.statusCompleted', 'Đã Giải Ngân'),
              value: processedCount,
              color: 'text-green-600',
              sub: 'trong kỳ này',
            },
            {
              label: t('payouts.title', 'Tổng Yêu Cầu'),
              value: payouts.length,
              color: 'text-blue-600',
              sub: 'tất cả thời gian',
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              variant="borderless"
              className="rounded-xl shadow-xs text-center"
            >
              <Text className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</Text>
              <div className="text-gray-800 text-sm font-medium mt-1">{stat.label}</div>
              <div className="text-gray-400 text-xs">{stat.sub}</div>
            </Card>
          ))}
        </div>

        <Card variant="borderless" className="rounded-xl shadow-xs">
          <Space direction="vertical" className="w-full" size="middle">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex-1 min-w-75">
                <SearchFilterBox
                  searchPlaceholder={t('common.search', 'Tìm theo tên nhà hàng...')}
                  searchValue={search}
                  onSearchChange={setSearch}
                  filterLabel={t('common.status', 'Lọc Trạng Thái:')}
                  filterValue={statusFilter}
                  onFilterChange={setStatusFilter}
                  filterOptions={filterOptions}
                />
              </div>
              <Button
                onClick={handleExportCsv}
                className="!bg-orange-500 !text-white font-medium hover:!bg-orange-600 border-none shadow-xs"
              >
                📥 Xuất Báo Cáo Sao Kê (CSV)
              </Button>
            </div>

            <DataTable<PayoutRecord>
              rowKey="id"
              dataSource={payouts}
              columns={columns}
              loading={isLoading}
              emptyDescription={t(
                'payouts.emptyDescription',
                'Không tìm thấy yêu cầu giải ngân phù hợp',
              )}
            />
          </Space>
        </Card>
      </Space>
    </PageContainer>
  );
}
