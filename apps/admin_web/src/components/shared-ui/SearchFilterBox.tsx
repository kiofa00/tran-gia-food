import React from 'react';

import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Col, Input, Row, Select, Typography } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';
import { cn } from '@/utils/cn';

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
  className?: string;
}

export const SearchFilterBox: React.FC<SearchFilterBoxProps> = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterLabel,
  filterValue,
  onFilterChange,
  filterOptions = [],
  extraAction,
  className,
}) => {
  const { t } = useTranslation();

  const resolvedPlaceholder = searchPlaceholder || t('common.search', 'Tìm kiếm...');
  const resolvedFilterLabel = filterLabel || t('common.filter', 'Lọc:');

  return (
    <Card variant="borderless" className={cn('bg-gray-50 rounded-lg p-3 !mb-4', className)}>
      <Row gutter={[12, 12]} align="middle" justify="space-between">
        <Col xs={24} sm={14} md={10}>
          <Input
            placeholder={resolvedPlaceholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={10} md={14}>
          <div className="flex flex-row items-center justify-end gap-2">
            {filterOptions.length > 0 && onFilterChange && (
              <>
                <div className="flex items-center gap-1.5 shrink-0">
                  <FilterOutlined className="text-slate-400" />
                  <Text type="secondary">{resolvedFilterLabel}</Text>
                </div>
                <Select
                  value={filterValue}
                  onChange={onFilterChange}
                  className="flex-1 sm:flex-none sm:min-w-40"
                >
                  {filterOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </>
            )}
            {extraAction}
          </div>
        </Col>
      </Row>
    </Card>
  );
};
