import { Empty, Table, TableProps } from 'antd';

export interface DataTableProps<T> extends TableProps<T> {
  emptyDescription?: string;
  defaultPageSize?: number;
}

export function DataTable<T extends object>({
  emptyDescription = 'Không có dữ liệu',
  defaultPageSize = 10,
  loading,
  pagination,
  ...tableProps
}: DataTableProps<T>) {
  const tablePaginationConfig =
    pagination !== false
      ? {
          defaultPageSize,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          ...pagination,
        }
      : false;

  return (
    <Table<T>
      {...tableProps}
      loading={loading}
      pagination={tablePaginationConfig}
      className={`min-h-[260px] ${tableProps.className || ''}`}
      locale={{
        emptyText: loading ? null : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />
        ),
        ...tableProps.locale,
      }}
    />
  );
}
