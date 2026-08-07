'use client';

import { useState } from 'react';

import { BankOutlined } from '@ant-design/icons';
import { App, Button, Card } from 'antd';

import {
  CommissionsStats,
  DataTable,
  PageContainer,
  PageHeader,
  SearchFilterBox,
  getCommissionsColumns,
  useCommissionsQuery,
} from '@/components';
import { COMMISSIONS_STATUS_FILTER_OPTIONS } from '@/shared-config';
import { CommissionRecord } from '@/types';

export default function CommissionsPage() {
  const { message } = App.useApp();
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

  const rawList: Record<string, unknown>[] = isPaginated
    ? ((rawCommissions as { data: Record<string, unknown>[] }).data ?? [])
    : ((rawCommissions as Record<string, unknown>[]) ?? []);

  const totalItems: number = isPaginated
    ? ((rawCommissions as { total: number }).total ?? 0)
    : rawList.length;

  const commissions: CommissionRecord[] = rawList.map(
    (item: Record<string, unknown>, idx: number) => ({
      key: String(item.id || item.key || idx + 1),
      orderId: String(item.orderId || `ORD-${item.id || idx + 1}`),
      restaurantName: String(item.restaurantName || item.restaurant || 'Quán ăn'),
      foodAmount: Number(item.foodAmount || item.totalFoodGmv) || 0,
      shipAmount: Number(item.shipAmount || item.shipFee) || 0,
      restaurantShare: Number(item.restaurantShare) || 0,
      shipperShare: Number(item.shipperShare) || 0,
      platformShare: Number(item.platformShare || item.platformCommission) || 0,
      status: item.status === 'PAID' || item.status === 'PROCESSED' ? 'PROCESSED' : 'PENDING',
      createdAt: String(item.createdAt || ''),
    }),
  );

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const totalPlatformCommission = commissions.reduce((sum, item) => sum + item.platformShare, 0);
  const totalRestaurantRevenue = commissions.reduce((sum, item) => sum + item.restaurantShare, 0);
  const totalShipperDelivery = commissions.reduce((sum, item) => sum + item.shipperShare, 0);

  const handleProcessPayout = () => {
    message.success('Đã hoàn tất quyết toán hoa hồng & giải ngân vào Ví đối tác thành công!');
  };

  const columns = getCommissionsColumns();

  return (
    <PageContainer>
      <PageHeader
        icon="💰"
        title="Hoa Hồng Sàn & Giải Ngân Ví Đối Tác"
        subtitle="Phân bổ doanh thu tự động giữa Quán ăn (85%), Shipper (100% phí ship) & Sàn Tran Gia (15%)"
        action={
          <Button
            type="primary"
            icon={<BankOutlined />}
            size="large"
            onClick={handleProcessPayout}
            className="bg-green-600 font-semibold border-none"
          >
            Duyệt Quyết Toán Ví
          </Button>
        }
      />

      <CommissionsStats
        loading={loading}
        totalPlatformCommission={totalPlatformCommission}
        totalRestaurantRevenue={totalRestaurantRevenue}
        totalShipperDelivery={totalShipperDelivery}
      />

      <SearchFilterBox
        searchPlaceholder="Tìm theo mã đơn hoặc tên quán..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        filterLabel="Lọc trạng thái:"
        filterValue={statusFilter}
        onFilterChange={handleFilterChange}
        filterOptions={COMMISSIONS_STATUS_FILTER_OPTIONS}
      />

      <Card
        title="📋 Bảng Chi Tiết Phân Bổ Hoa Hồng Đơn Hàng"
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<CommissionRecord>
          rowKey="key"
          columns={columns}
          dataSource={commissions}
          loading={loading}
          scroll={{ x: 1200 }}
          emptyDescription="Chưa có dữ liệu hạch toán hoa hồng"
          pagination={{
            current: page,
            pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </PageContainer>
  );
}
