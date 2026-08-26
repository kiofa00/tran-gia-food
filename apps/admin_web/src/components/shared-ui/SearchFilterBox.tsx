import React from 'react';

import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Col, Input, Row, Select, Typography } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/utils/cn';

const { Text } = Typography;
const { Option } = Select;

export interface SelectOptionItem {
  readonly value: string;
  readonly label?: string;
  readonly i18nKey?: TranslationKey;
  readonly defaultLabel?: string;
}

interface SearchFilterBoxProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterLabel?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: readonly SelectOptionItem[];
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
  const { t } = useLocale();

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
              </>
            )}
            {extraAction}
          </div>
        </Col>
      </Row>
    </Card>
  );
};
