'use client';

import React from 'react';

import { Card, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { DataTable } from '@/components/shared-ui/DataTable';
import { SearchFilterBox } from '@/components/shared-ui/SearchFilterBox';
import { useLocale } from '@/hooks/useLocale';
import { DASHBOARD_SHIPPER_FILTER_OPTIONS } from '@/shared-config';

import { ShipperKycRecord } from '../types';

interface ShipperKycTableProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  shippers: ShipperKycRecord[];
  columns: ColumnsType<ShipperKycRecord>;
  loading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export const ShipperKycTable: React.FC<ShipperKycTableProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  shippers,
  columns,
  loading,
  page,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const { t } = useLocale();

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
        title={t('dashboard.shipperKycTitle', '📋 Danh Sách Hồ Sơ eKYC Shipper')}
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<ShipperKycRecord>
          rowKey="key"
          columns={columns}
          dataSource={shippers}
          loading={loading}
          scroll={{ x: 1100 }}
          emptyDescription={t('dashboard.emptyKycDescription', 'Không tìm thấy hồ sơ eKYC phù hợp')}
          pagination={{
            current: page,
            pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) =>
              `${t('common.total', 'Tổng')} ${total} ${t('users.driverUnit', 'tài xế')}`,
            onChange: onPageChange,
          }}
        />
      </Card>
    </Space>
  );
};
