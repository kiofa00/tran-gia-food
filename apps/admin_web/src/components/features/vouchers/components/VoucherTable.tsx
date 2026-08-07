'use client';

import { Card } from 'antd';

import { DataTable } from '@/components/shared-ui';

import type { VoucherRecord } from '../types';

interface VoucherTableProps {
  vouchers: VoucherRecord[];
  loading: boolean;
  columns: object[];
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export function VoucherTable({
  vouchers,
  loading,
  columns,
  page,
  pageSize,
  totalItems,
  onPageChange,
}: VoucherTableProps) {
  return (
    <Card variant="borderless" className="rounded-xl shadow-xs">
      <DataTable<VoucherRecord>
        rowKey="key"
        columns={columns}
        dataSource={vouchers}
        loading={loading}
        scroll={{ x: 1130 }}
        emptyDescription="Chưa có mã giảm giá"
        pagination={{
          current: page,
          pageSize,
          total: totalItems,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} voucher`,
          onChange: onPageChange,
        }}
      />
    </Card>
  );
}
