'use client';

import { useMemo } from 'react';

import { Space } from 'antd';

import {
  CmsMetrics,
  CmsServerStatusAlert,
  CmsTabsContainer,
  PageContainer,
  PageHeader,
  useCmsQuery,
} from '@/components';
import { useTranslation } from '@/providers/LanguageProvider';
import { CmsBannerItem, CmsFaqItem, CmsTranslationItem } from '@/types';

export default function CmsManagementPage() {
  const { t } = useTranslation();
  const { data: cmsData, isLoading, refetch: checkCmsStatus } = useCmsQuery();

  let cmsStatus = 'offline';

  if (isLoading) cmsStatus = 'checking';
  else if (cmsData?.isOnline) cmsStatus = 'online';

  const banners = useMemo<CmsBannerItem[]>(() => cmsData?.banners || [], [cmsData?.banners]);
  const translations = useMemo<CmsTranslationItem[]>(
    () => cmsData?.translations || [],
    [cmsData?.translations],
  );
  const faqs = useMemo<CmsFaqItem[]>(() => cmsData?.faqs || [], [cmsData?.faqs]);

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        <PageHeader
          icon="🖼️"
          title={t('cms.title', 'Quản Lý Nội Dung Hệ Thống (CMS)')}
          subtitle={t(
            'cms.subtitle',
            'Quản lý Banners, Khuyến mãi, Bản dịch i18n & Câu hỏi thường gặp FAQ',
          )}
        />

        <CmsServerStatusAlert cmsStatus={cmsStatus} onRefresh={() => checkCmsStatus()} />

        <CmsMetrics
          bannersCount={banners.length}
          translationsCount={translations.length}
          faqsCount={faqs.length}
        />

        <CmsTabsContainer
          banners={banners}
          translations={translations}
          faqs={faqs}
          isLoading={isLoading}
        />
      </Space>
    </PageContainer>
  );
}
