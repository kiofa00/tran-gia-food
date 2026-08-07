'use client';

import React from 'react';

import { Card } from 'antd';

import { DataTable } from '@/components/shared-ui/DataTable';
import { useTranslation } from '@/providers/LanguageProvider';
import { TopRestaurantItem } from '@/types';

import { useTopRestaurantsColumns } from './TopRestaurantsColumns';

interface TopRestaurantsTableProps {
  topRestaurants: TopRestaurantItem[];
  loading: boolean;
}

export const TopRestaurantsTable: React.FC<TopRestaurantsTableProps> = ({
  topRestaurants,
  loading,
}) => {
  const { t } = useTranslation();
  const columns = useTopRestaurantsColumns();

  return (
    <Card
      title={t('analytics.topRestaurantsTitle', '🏆 Top 10 Nhà Hàng Bán Chạy Nhất')}
      variant="borderless"
      className="rounded-xl shadow-xs"
    >
      <DataTable<TopRestaurantItem>
        rowKey="key"
        columns={columns}
        dataSource={topRestaurants}
        loading={loading}
        scroll={{ x: 800 }}
        emptyDescription={t('analytics.emptyTopRestaurants', 'Chưa có dữ liệu nhà hàng')}
      />
    </Card>
  );
};
