import React from 'react';
import { Card, Row, Col, Input, Select, Space, Typography } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';

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
    <Card
      variant="borderless"
      style={{
        backgroundColor: adminDesignTokens.colors.background,
        borderRadius: adminDesignTokens.borderRadius.md,
        padding: adminDesignTokens.padding.sm,
        marginBottom: 16,
      }}
    >
      <Row gutter={[12, 12]} align="middle" justify="space-between">
        <Col xs={24} sm={14} md={10}>
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined style={{ color: adminDesignTokens.colors.textSecondary }} />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={10} md={14}>
          <Space wrap align="center" style={{ width: '100%', justifyContent: 'flex-end' }}>
            {filterOptions.length > 0 && onFilterChange && (
              <>
                <FilterOutlined style={{ color: adminDesignTokens.colors.textSecondary }} />
                <Text type="secondary">{filterLabel}</Text>
                <Select value={filterValue} onChange={onFilterChange} style={{ minWidth: 160 }}>
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
