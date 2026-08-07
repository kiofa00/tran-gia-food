'use client';

import React, { useMemo, useState } from 'react';

import { Space } from 'antd';

import { DataTable } from '@/components/shared-ui/DataTable';
import { SearchFilterBox } from '@/components/shared-ui/SearchFilterBox';
import { useTranslation } from '@/providers/LanguageProvider';
import { CMS_FAQ_TARGET_FILTER_OPTIONS } from '@/shared-config';
import { CmsFaqItem } from '@/types';

import { useFaqColumns } from './CmsColumns';

interface FaqTabProps {
  faqs: CmsFaqItem[];
  isLoading: boolean;
}

export const FaqTab: React.FC<FaqTabProps> = ({ faqs, isLoading }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [targetFilter, setTargetFilter] = useState('ALL');

  const filteredFaqs = useMemo(
    () =>
      faqs.filter((item) => {
        const matchesSearch =
          !search ||
          (item.question || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.answer || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.category || '').toLowerCase().includes(search.toLowerCase());
        const matchesApp =
          targetFilter === 'ALL' ||
          (item.targetApp || 'ALL').toUpperCase() === targetFilter.toUpperCase();

        return matchesSearch && matchesApp;
      }),
    [faqs, search, targetFilter],
  );

  const columns = useFaqColumns();

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <SearchFilterBox
        searchPlaceholder={t(
          'common.search',
          'Tìm kiếm theo câu hỏi, câu trả lời hoặc danh mục...',
        )}
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel={t('users.role', 'Ứng Dụng Hỗ Trợ:')}
        filterValue={targetFilter}
        onFilterChange={setTargetFilter}
        filterOptions={CMS_FAQ_TARGET_FILTER_OPTIONS}
      />
      <DataTable<CmsFaqItem>
        rowKey="id"
        dataSource={filteredFaqs}
        columns={columns}
        loading={isLoading}
        emptyDescription={t('common.noData', 'Chưa có câu hỏi hỗ trợ FAQ')}
      />
    </Space>
  );
};
