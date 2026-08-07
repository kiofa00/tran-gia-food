'use client';

import React, { useMemo, useState } from 'react';

import { Space } from 'antd';

import { DataTable } from '@/components/shared-ui/DataTable';
import { SearchFilterBox } from '@/components/shared-ui/SearchFilterBox';
import { useTranslation } from '@/providers/LanguageProvider';
import { CMS_BANNER_STATUS_FILTER_OPTIONS } from '@/shared-config';
import { CmsBannerItem } from '@/types';

import { useBannerColumns } from './CmsColumns';

interface BannerTabProps {
  banners: CmsBannerItem[];
  isLoading: boolean;
}

export const BannerTab: React.FC<BannerTabProps> = ({ banners, isLoading }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBanners = useMemo(
    () =>
      banners.filter((item) => {
        const matchesSearch =
          !search ||
          (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.linkUrl || '').toLowerCase().includes(search.toLowerCase());
        const isActive = item.isActive !== false;
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && isActive) ||
          (statusFilter === 'INACTIVE' && !isActive);

        return matchesSearch && matchesStatus;
      }),
    [banners, search, statusFilter],
  );

  const columns = useBannerColumns();

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <SearchFilterBox
        searchPlaceholder={t('common.search', 'Tìm kiếm tên Banner hoặc link...')}
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel={t('users.filterStatus', 'Trạng thái:')}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={CMS_BANNER_STATUS_FILTER_OPTIONS}
      />
      <DataTable<CmsBannerItem>
        rowKey="id"
        dataSource={filteredBanners}
        columns={columns}
        loading={isLoading}
        emptyDescription={t('common.noData', 'Chưa có banner quảng cáo')}
      />
    </Space>
  );
};
