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
import { PAYOUT_STATUS_FILTER_OPTIONS } from '@/shared-config';
import { convertToCsv, downloadCsv } from '@/utils';

const { Text } = Typography;

export default function PayoutsManagementPage() {
  const { message } = App.useApp();

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
        title: 'Xác nhận giải ngân?',
        content: `Giải ngân ${record.amount.toLocaleString('vi-VN')}đ cho "${record.restaurantName}"?`,
        okText: 'Giải Ngân',
        onOk: () =>
          processMutation.mutate(record.id, {
            onSuccess: () => message.success('Đã giải ngân thành công!'),
            onError: () => message.error('Thao tác thất bại.'),
          }),
      });
    },
    [processMutation, message],
  );

  const handleReject = useCallback(
    (record: PayoutRecord) => {
      Modal.confirm({
        title: 'Từ chối giải ngân?',
        content: `Từ chối yêu cầu giải ngân của "${record.restaurantName}"?`,
        okText: 'Từ Chối',
        okButtonProps: { danger: true },
        onOk: () =>
          rejectMutation.mutate(
            { payoutId: record.id, reason: 'Thông tin không hợp lệ' },
            {
              onSuccess: () => message.success('Đã từ chối yêu cầu giải ngân.'),
              onError: () => message.error('Thao tác thất bại.'),
            },
          ),
      });
    },
    [rejectMutation, message],
  );

  const handleExportCsv = useCallback(() => {
    if (payouts.length === 0) {
      message.warning('Không có dữ liệu để xuất file');

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
    message.success(`Đã xuất ${payouts.length} bản ghi sao kê ra file CSV`);
  }, [payouts, message]);

  const columns = useMemo(
    () => getPayoutColumns({ onProcess: handleProcess, onReject: handleReject }),
    [handleProcess, handleReject],
  );

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        <PageHeader
          icon="💰"
          title="Quản Lý Giải Ngân"
          subtitle="Xử lý các yêu cầu thanh toán cho nhà hàng và tài xế"
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Chờ Giải Ngân',
              value: `${pendingAmount.toLocaleString('vi-VN')}đ`,
              color: 'text-orange-500',
              sub: `${pendingCount} yêu cầu`,
            },
            {
              label: 'Đã Giải Ngân',
              value: processedCount,
              color: 'text-green-600',
              sub: 'trong kỳ này',
            },
            {
              label: 'Tổng Yêu Cầu',
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
              <div className="flex-1 min-w-[300px]">
                <SearchFilterBox
                  searchPlaceholder="Tìm theo tên nhà hàng..."
                  searchValue={search}
                  onSearchChange={setSearch}
                  filterLabel="Lọc Trạng Thái:"
                  filterValue={statusFilter}
                  onFilterChange={setStatusFilter}
                  filterOptions={PAYOUT_STATUS_FILTER_OPTIONS}
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
              emptyDescription="Không tìm thấy yêu cầu giải ngân phù hợp"
            />
          </Space>
        </Card>
      </Space>
    </PageContainer>
  );
}
