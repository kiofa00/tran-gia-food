'use client';

import { ReactNode, useState } from 'react';

import { Empty, Pagination, Table, TableProps } from 'antd';

export interface DataTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  emptyDescription?: string;
  defaultPageSize?: number;
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
  emptyDescription = 'Không có dữ liệu',
  defaultPageSize = 10,
  loading,
  pagination,
  dataSource,
  ...tableProps
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const locale = {
    emptyText: loading ? null : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />
    ),
    ...tableProps.locale,
  };

  // Pagination disabled
  if (pagination === false) {
    return (
      <Table<T>
        {...tableProps}
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        locale={locale}
      />
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
    <div className="flex flex-col min-h-65">
      {/* Table without built-in pagination */}
      <Table<T>
        {...tableProps}
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
          showTotal={(t, range) => `${range[0]}-${range[1]} của ${t} mục`}
          onChange={handleChange}
          onShowSizeChange={handleChange}
        />
      </div>
    </div>
  );
}
