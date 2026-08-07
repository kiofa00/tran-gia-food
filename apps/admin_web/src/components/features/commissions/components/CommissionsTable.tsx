'use client';

import React from 'react';

import { Card, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { DataTable } from '@/components/shared-ui/DataTable';
import { SearchFilterBox } from '@/components/shared-ui/SearchFilterBox';
import { useTranslation } from '@/providers/LanguageProvider';
import { COMMISSIONS_STATUS_FILTER_OPTIONS } from '@/shared-config';
import { CommissionRecord } from '@/types';

interface CommissionsTableProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  commissions: CommissionRecord[];
  columns: ColumnsType<CommissionRecord>;
  loading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export const CommissionsTable: React.FC<CommissionsTableProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  commissions,
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
        searchPlaceholder={t('commissions.searchPlaceholder', 'Tìm kiếm theo mã ví hoặc tên...')}
        searchValue={search}
        onSearchChange={onSearchChange}
        filterLabel={t('commissions.filterRoleLabel', 'Lọc đối tượng:')}
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterOptions={COMMISSIONS_STATUS_FILTER_OPTIONS}
      />

      <Card
        title={t('commissions.tableTitle', '📊 Bảng Số Dư & Hoa Hồng Tương Ứng')}
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<CommissionRecord>
          rowKey="key"
          columns={columns}
          dataSource={commissions}
          loading={loading}
          scroll={{ x: 1200 }}
          emptyDescription={t('commissions.emptyDescription', 'Không có dữ liệu đối soát')}
          pagination={{
            current: page,
            pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) =>
              `${t('dashboard.totalPrefix', 'Tổng')} ${total} ${t('common.items', 'mục')}`,
            onChange: onPageChange,
          }}
        />
      </Card>
    </Space>
  );
};
