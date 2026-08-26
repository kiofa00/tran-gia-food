import React from 'react';

import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Col, Input, Row, Select, Space, Typography } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/utils/cn';

const { Text } = Typography;
const { Option } = Select;

export interface FilterOption {
  readonly value: string;
  readonly label?: string;
  readonly i18nKey?: TranslationKey;
  readonly defaultLabel?: string;
}

interface FilterToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterLabel?: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: readonly FilterOption[];
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterLabel,
  filterValue,
  onFilterChange,
  filterOptions,
  className,
}) => {
  const { t } = useLocale();

  const resolvedPlaceholder = searchPlaceholder || t('common.search', 'Tìm kiếm...');
  const resolvedFilterLabel = filterLabel || t('common.filter', 'Lọc:');

  return (
    <Card variant="borderless" className={cn('bg-gray-50 rounded-lg p-3', className)}>
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={14} md={10}>
          <Input
            placeholder={resolvedPlaceholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={10} md={8}>
          <Space wrap align="center">
            <FilterOutlined className="text-gray-500" />
            <Text type="secondary">{resolvedFilterLabel}</Text>
            <Select value={filterValue} onChange={onFilterChange} className="min-w-40">
              {filterOptions.map((opt) => {
                const displayLabel = opt.i18nKey
                  ? t(opt.i18nKey, opt.defaultLabel || opt.label || opt.value)
                  : opt.label || opt.value;

                return (
                  <Option key={opt.value} value={opt.value}>
                    {displayLabel}
                  </Option>
                );
              })}
            </Select>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
