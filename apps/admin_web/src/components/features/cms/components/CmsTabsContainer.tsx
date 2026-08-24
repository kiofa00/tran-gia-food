'use client';

import React from 'react';

import { GlobalOutlined, PictureOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Tabs } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import { CmsBannerItem, CmsFaqItem, CmsTranslationItem } from '@/types';

import { BannerTab } from './BannerTab';
import { FaqTab } from './FaqTab';
import { TranslationTab } from './TranslationTab';

interface CmsTabsContainerProps {
  banners: CmsBannerItem[];
  translations: CmsTranslationItem[];
  faqs: CmsFaqItem[];
  isLoading: boolean;
}

export const CmsTabsContainer: React.FC<CmsTabsContainerProps> = ({
  banners,
  translations,
  faqs,
  isLoading,
}) => {
  const { t } = useLocale();

  return (
    <Card variant="borderless" className="rounded-xl shadow-xs">
      <Tabs
        items={[
          {
            key: 'translations',
            label: (
              <span>
                <GlobalOutlined /> {t('cms.tabTranslations', 'Bản Dịch i18n')} (
                {translations.length})
              </span>
            ),
            children: <TranslationTab translations={translations} isLoading={isLoading} />,
          },
          {
            key: 'banners',
            label: (
              <span>
                <PictureOutlined /> {t('cms.tabBanners', 'Banners Quảng Cáo')} ({banners.length})
              </span>
            ),
            children: <BannerTab banners={banners} isLoading={isLoading} />,
          },
          {
            key: 'faqs',
            label: (
              <span>
                <QuestionCircleOutlined /> {t('cms.tabFaqs', 'Câu Hỏi FAQ')} ({faqs.length})
              </span>
            ),
            children: <FaqTab faqs={faqs} isLoading={isLoading} />,
          },
        ]}
      />
    </Card>
  );
};
