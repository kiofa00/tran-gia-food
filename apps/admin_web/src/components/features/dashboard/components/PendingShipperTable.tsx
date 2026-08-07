'use client';

import React from 'react';

import { Card, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { DataTable } from '@/components/shared-ui/DataTable';
import { SearchFilterBox } from '@/components/shared-ui/SearchFilterBox';
import { useTranslation } from '@/providers/LanguageProvider';
import { DASHBOARD_SHIPPER_FILTER_OPTIONS } from '@/shared-config';

import { PendingShipperRecord } from '../types';

interface PendingShipperTableProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  pendingShippers: PendingShipperRecord[];
  columns: ColumnsType<PendingShipperRecord>;
  loading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export const PendingShipperTable: React.FC<PendingShipperTableProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  pendingShippers,
  columns,
  loading,
  page,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const { t } = useTranslation();

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <SearchFilterBox
        searchPlaceholder={t(
          'dashboard.searchShipperPlaceholder',
          'Tìm theo tên hoặc SĐT tài xế...',
        )}
        searchValue={search}
        onSearchChange={onSearchChange}
        filterLabel={t('dashboard.filterKycLabel', 'Lọc trạng thái eKYC:')}
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterOptions={DASHBOARD_SHIPPER_FILTER_OPTIONS}
      />

      <Card
        title={t('dashboard.pendingKycTitle', '📋 Danh Sách Shipper Chờ Duyệt eKYC')}
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<PendingShipperRecord>
          rowKey="key"
          columns={columns}
          dataSource={pendingShippers}
          loading={loading}
          scroll={{ x: 1100 }}
          emptyDescription={t('dashboard.emptyKycDescription', 'Không có tài xế chờ duyệt eKYC')}
          pagination={{
            current: page,
            pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) =>
              `${t('dashboard.totalPrefix', 'Tổng')} ${total} ${t('users.driverUnit', 'tài xế')}`,
            onChange: onPageChange,
          }}
        />
      </Card>
    </Space>
  );
};
