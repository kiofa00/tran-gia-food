'use client';

import React from 'react';

import { Card, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { DataTable } from '@/components/shared-ui/DataTable';
import { SearchFilterBox } from '@/components/shared-ui/SearchFilterBox';
import { useTranslation } from '@/providers/LanguageProvider';
import { FLEET_STATUS_FILTER_OPTIONS } from '@/shared-config';
import { ShipperRecord } from '@/types';

interface FleetTableProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  shippers: ShipperRecord[];
  columns: ColumnsType<ShipperRecord>;
  loading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export const FleetTable: React.FC<FleetTableProps> = ({
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
  const { t } = useTranslation();

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <SearchFilterBox
        searchPlaceholder={t('fleet.searchPlaceholder', 'Tìm theo tên hoặc SĐT tài xế...')}
        searchValue={search}
        onSearchChange={onSearchChange}
        filterLabel={t('common.filter', 'Lọc trạng thái:')}
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterOptions={FLEET_STATUS_FILTER_OPTIONS}
      />

      <Card
        title={t('fleet.tableTitle', '⚡ Danh Sách Tài Xế Đang Online ({total})', {
          total: totalItems,
        })}
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<ShipperRecord>
          rowKey="key"
          columns={columns}
          dataSource={shippers}
          loading={loading}
          scroll={{ x: 1060 }}
          emptyDescription={t('fleet.emptyDescription', 'Chưa có tài xế trực tuyến')}
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
