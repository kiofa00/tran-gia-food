import React from 'react';

import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Col, Input, Row, Select, Space, Typography } from 'antd';

const { Text } = Typography;
const { Option } = Select;

export interface SelectOptionItem {
  value: string;
  label: string;
}

interface SearchFilterBoxProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterLabel?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: SelectOptionItem[];
  extraAction?: React.ReactNode;
}

export const SearchFilterBox: React.FC<SearchFilterBoxProps> = ({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  filterLabel = 'Lọc:',
  filterValue,
  onFilterChange,
  filterOptions = [],
  extraAction,
}) => {
  return (
    <Card variant="borderless" className="bg-gray-50 rounded-lg p-3 mb-4">
      <Row gutter={[12, 12]} align="middle" justify="space-between">
        <Col xs={24} sm={14} md={10}>
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={10} md={14}>
          <Space wrap align="center" className="w-full justify-end">
            {filterOptions.length > 0 && onFilterChange && (
              <>
                <FilterOutlined className="text-slate-400" />
                <Text type="secondary">{filterLabel}</Text>
                <Select value={filterValue} onChange={onFilterChange} className="min-w-40">
                  {filterOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </>
            )}
            {extraAction}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
