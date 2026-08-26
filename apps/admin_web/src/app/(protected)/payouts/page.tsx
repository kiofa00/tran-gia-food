'use client';

import { useCallback, useMemo, useState } from 'react';

import { App, Button, Card, Space, Typography } from 'antd';

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
import { convertToCsv, downloadCsv, formatCurrency } from '@/utils';

const { Text } = Typography;

export default function PayoutsManagementPage() {
  const { message, modal } = App.useApp();
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
      modal.confirm({
        title: t('payouts.process', 'Xác nhận giải ngân?'),
        content: t('payouts.processConfirmContent', 'Giải ngân {amount} cho "{name}"?', {
          amount: formatCurrency(record.amount),
          name: record.restaurantName,
        }),
        okText: t('payouts.process', 'Giải Ngân'),
        cancelText: t('common.cancel', 'Hủy'),
        onOk: async () => {
          try {
            await processMutation.mutateAsync(record.id);
            message.success(t('common.success', 'Đã giải ngân thành công!'));
          } catch {
            message.error(t('common.errorTryAgain', 'Thao tác thất bại.'));
          }
        },
      });
    },
    [processMutation, message, modal, t],
  );

  const handleReject = useCallback(
    (record: PayoutRecord) => {
      modal.confirm({
        title: t('payouts.reject', 'Từ chối giải ngân?'),
        content: t('payouts.rejectConfirmContent', 'Từ chối yêu cầu giải ngân của "{name}"?', {
          name: record.restaurantName,
        }),
        okText: t('payouts.reject', 'Từ Chối'),
        cancelText: t('common.cancel', 'Hủy'),
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await rejectMutation.mutateAsync({
              payoutId: record.id,
              reason: t('payouts.invalidInfoReason', 'Thông tin không hợp lệ'),
            });
            message.success(t('common.success', 'Đã từ chối yêu cầu giải ngân.'));
          } catch {
            message.error(t('common.errorTryAgain', 'Thao tác thất bại.'));
          }
        },
      });
    },
    [rejectMutation, message, modal, t],
  );

  const handleExportCsv = useCallback(() => {
    if (payouts.length === 0) {
      message.warning(t('payouts.emptyDescription', 'Không có dữ liệu để xuất file'));

      return;
    }

    const csvContent = convertToCsv(payouts, [
      { header: t('payouts.requestId', 'Mã Yêu Cầu'), key: 'id' },
      { header: t('payouts.partnerName', 'Đối Tác / Quán'), key: 'restaurantName' },
      {
        header: t('payouts.amountVnd', 'Số Tiền (VNĐ)'),
        key: (p) => p.amount,
      },
      { header: t('common.status', 'Trạng Thái'), key: 'status' },
      { header: t('payouts.requestedAt', 'Kỳ Thanh Toán'), key: 'period' },
      { header: t('users.createdAt', 'Ngày Tạo'), key: 'createdAt' },
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
              value: formatCurrency(pendingAmount),
              color: 'text-orange-500',
              sub: t('payouts.pendingRequestsCount', '{count} yêu cầu', {
                count: pendingCount,
              }),
            },
            {
              label: t('payouts.statusCompleted', 'Đã Giải Ngân'),
              value: processedCount,
              color: 'text-green-600',
              sub: t('payouts.thisPeriod', 'trong kỳ này'),
            },
            {
              label: t('payouts.totalRequests', 'Tổng Yêu Cầu'),
              value: payouts.length,
              color: 'text-blue-600',
              sub: t('payouts.allTime', 'tất cả thời gian'),
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
                  searchPlaceholder={t(
                    'payouts.searchPlaceholder',
                    'Tìm theo tên nhà hàng hoặc mã giao dịch...',
                  )}
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
                {t('payouts.exportCsvBtn', '📥 Xuất Báo Cáo Sao Kê (CSV)')}
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
