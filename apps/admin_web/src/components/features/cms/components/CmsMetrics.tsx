'use client';

import React from 'react';

import { GlobalOutlined, PictureOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';

import { MetricCard } from '@/components/shared-ui/MetricCard';
import { useTranslation } from '@/providers/LanguageProvider';
import { adminDesignTokens } from '@/theme/tokens';

interface CmsMetricsProps {
  bannersCount: number;
  translationsCount: number;
  faqsCount: number;
}

export const CmsMetrics: React.FC<CmsMetricsProps> = ({
  bannersCount,
  translationsCount,
  faqsCount,
}) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <MetricCard
          icon={<PictureOutlined />}
          label={t('cms.bannerTitle', 'Banner Đang Chạy')}
          value={`${bannersCount} Banner`}
          iconColor={adminDesignTokens.colors.primary}
        />
      </Col>
      <Col xs={24} sm={8}>
        <MetricCard
          icon={<GlobalOutlined />}
          label={t('cms.tabTranslations', 'Từ Điển i18n & Text Động')}
          value={`${translationsCount} Keys`}
          iconColor={adminDesignTokens.colors.statusApproved}
        />
      </Col>
      <Col xs={24} sm={8}>
        <MetricCard
          icon={<QuestionCircleOutlined />}
          label={t('cms.tabFaqs', 'Bài Viết Trợ Giúp FAQ')}
          value={`${faqsCount} Câu Hỏi`}
          iconColor={adminDesignTokens.colors.statusPending}
        />
      </Col>
    </Row>
  );
};
