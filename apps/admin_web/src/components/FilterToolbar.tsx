import React from 'react';
import { Card, Row, Col, Input, Select, Space, Typography } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';

const { Text } = Typography;
const { Option } = Select;

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterLabel?: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  filterLabel = 'Lọc:',
  filterValue,
  onFilterChange,
  filterOptions,
}) => {
  return (
    <Card variant="borderless" style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 12 }}>
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={14} md={10}>
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={10} md={8}>
          <Space wrap align="center">
            <FilterOutlined style={{ color: adminDesignTokens.colors.textSecondary }} />
            <Text type="secondary">{filterLabel}</Text>
            <Select value={filterValue} onChange={onFilterChange} style={{ minWidth: 160 }}>
              {filterOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
