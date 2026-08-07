'use client';

import React, { useMemo, useState } from 'react';

import { Space } from 'antd';

import { DataTable } from '@/components/shared-ui/DataTable';
import { SearchFilterBox } from '@/components/shared-ui/SearchFilterBox';
import { useTranslation } from '@/providers/LanguageProvider';
import { CMS_APP_TARGET_FILTER_OPTIONS } from '@/shared-config';
import { CmsTranslationItem } from '@/types';

import { useTranslationColumns } from './CmsColumns';

interface TranslationTabProps {
  translations: CmsTranslationItem[];
  isLoading: boolean;
}

export const TranslationTab: React.FC<TranslationTabProps> = ({ translations, isLoading }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [appTargetFilter, setAppTargetFilter] = useState('ALL');

  const filteredTranslations = useMemo(
    () =>
      translations.filter((item) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          !search ||
          Object.entries(item).some(([key, val]) => {
            if (key === 'id' || key === 'createdAt' || key === 'updatedAt') return false;

            return typeof val === 'string' && val.toLowerCase().includes(searchLower);
          });
        const matchesApp =
          appTargetFilter === 'ALL' ||
          (item.appTarget || 'ALL').toUpperCase() === appTargetFilter.toUpperCase();

        return matchesSearch && matchesApp;
      }),
    [translations, search, appTargetFilter],
  );

  const columns = useTranslationColumns(translations);

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <SearchFilterBox
        searchPlaceholder={t('common.search', 'Tìm kiếm theo Key, Tiếng Việt hoặc Tiếng Anh...')}
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel={t('users.role', 'Ứng Dụng:')}
        filterValue={appTargetFilter}
        onFilterChange={setAppTargetFilter}
        filterOptions={CMS_APP_TARGET_FILTER_OPTIONS}
      />
      <DataTable<CmsTranslationItem>
        rowKey="id"
        dataSource={filteredTranslations}
        columns={columns}
        loading={isLoading}
        emptyDescription={t('common.noData', 'Không tìm thấy bản dịch phù hợp')}
      />
    </Space>
  );
};
