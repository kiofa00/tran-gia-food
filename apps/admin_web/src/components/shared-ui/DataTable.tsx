'use client';

import { ReactNode, useState } from 'react';

import { Empty, Pagination, Table, TableProps } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';
import { cn } from '@/utils/cn';

export interface DataTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  emptyDescription?: string;
  defaultPageSize?: number;
  className?: string;
  /** Pass false to disable pagination, or an object for server-side pagination config */
  pagination?:
    | false
    | {
        total?: number;
        current?: number;
        pageSize?: number;
        showSizeChanger?: boolean;
        showTotal?: (total: number, range: [number, number]) => ReactNode;
        onChange?: (page: number, size: number) => void;
      };
}

export function DataTable<T extends object>({
  emptyDescription,
  defaultPageSize = 10,
  loading,
  pagination,
  dataSource,
  className,
  ...tableProps
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const resolvedEmptyDescription = emptyDescription || t('common.noData', 'Không có dữ liệu');

  const locale = {
    emptyText: loading ? null : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={resolvedEmptyDescription} />
    ),
    ...tableProps.locale,
  };

  const tableClassName =
    'flex-1 flex flex-col [&_.ant-spin-nested-loading]:flex-1 [&_.ant-spin-nested-loading]:flex [&_.ant-spin-nested-loading]:flex-col [&_.ant-spin-container]:flex-1 [&_.ant-spin-container]:flex [&_.ant-spin-container]:flex-col';

  // Pagination disabled
  if (pagination === false) {
    return (
      <div className={cn('flex flex-col min-h-96', className)}>
        <Table<T>
          {...tableProps}
          className={tableClassName}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          locale={locale}
        />
      </div>
    );
  }

  // Server-side pagination: parent controls total/current/pageSize
  const isServerPagination = pagination && pagination.total !== undefined;

  const currentPage = isServerPagination ? (pagination!.current ?? page) : page;
  const currentSize = isServerPagination ? (pagination!.pageSize ?? pageSize) : pageSize;
  const total = isServerPagination ? pagination!.total! : (dataSource?.length ?? 0);

  // Client-side: slice data ourselves; server-side: use data as-is
  const pagedData = isServerPagination
    ? dataSource
    : dataSource?.slice((currentPage - 1) * currentSize, currentPage * currentSize);

  const handleChange = (newPage: number, newSize: number) => {
    if (!isServerPagination) {
      setPage(newPage);
      setPageSize(newSize);
    }
    if (pagination && pagination.onChange) {
      pagination.onChange(newPage, newSize);
    }
  };

  return (
    <div className={cn('flex flex-col min-h-96', className)}>
      {/* Table without built-in pagination */}
      <Table<T>
        {...tableProps}
        className={tableClassName}
        dataSource={pagedData}
        loading={loading}
        pagination={false}
        locale={locale}
      />

      {/* Pagination pinned to bottom via mt-auto */}
      <div className="mt-auto flex justify-end items-center py-3 px-1 border-t border-gray-100">
        <Pagination
          current={currentPage}
          pageSize={currentSize}
          total={total}
          showSizeChanger
          pageSizeOptions={['5', '10', '20', '50']}
          showTotal={
            pagination && pagination.showTotal
              ? pagination.showTotal
              : (totalCount, range) =>
                  `${range[0]}-${range[1]} ${t('common.of', 'của')} ${totalCount} ${t('common.items', 'mục')}`
          }
          onChange={handleChange}
          onShowSizeChange={handleChange}
        />
      </div>
    </div>
  );
}
