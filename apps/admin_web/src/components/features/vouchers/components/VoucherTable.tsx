'use client';

import { Card } from 'antd';

import { DataTable } from '@/components/shared-ui';
import { useLocale } from '@/hooks';

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
  const { t } = useLocale();

  return (
    <Card variant="borderless" className="rounded-xl shadow-xs">
      <DataTable<VoucherRecord>
        rowKey="key"
        columns={columns}
        dataSource={vouchers}
        loading={loading}
        scroll={{ x: 1130 }}
        emptyDescription={t('vouchers.emptyDescription', 'Chưa có mã giảm giá nào')}
        pagination={{
          current: page,
          pageSize,
          total: totalItems,
          showSizeChanger: true,
          showTotal: (total) =>
            `${t('common.total', 'Tổng')} ${total} ${t('vouchers.voucherUnit', 'mã')}`,
          onChange: onPageChange,
        }}
      />
    </Card>
  );
}
