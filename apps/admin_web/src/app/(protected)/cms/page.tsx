'use client';

import { useState } from 'react';

import {
  CheckCircleOutlined,
  ExportOutlined,
  GlobalOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Row, Space, Tabs, Tag, Typography } from 'antd';

import {
  DataTable,
  MetricCard,
  PageContainer,
  PageHeader,
  SearchFilterBox,
  getBannerColumns,
  getFaqColumns,
  getTranslationColumns,
  useCmsQuery,
} from '@/components';
import {
  CMS_APP_TARGET_FILTER_OPTIONS,
  CMS_BANNER_STATUS_FILTER_OPTIONS,
  CMS_FAQ_TARGET_FILTER_OPTIONS,
} from '@/shared-config';
import { adminDesignTokens } from '@/theme/tokens';
import { CmsBannerItem, CmsFaqItem, CmsTranslationItem } from '@/types';

const { Text } = Typography;

export default function CmsManagementPage() {
  const { data: cmsData, isLoading, refetch: checkCmsStatus } = useCmsQuery();

  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerStatusFilter, setBannerStatusFilter] = useState('ALL');
  const [translationSearch, setTranslationSearch] = useState('');
  const [appTargetFilter, setAppTargetFilter] = useState('ALL');
  const [faqSearch, setFaqSearch] = useState('');
  const [faqTargetFilter, setFaqTargetFilter] = useState('ALL');

  let cmsStatus = 'offline';

  if (isLoading) cmsStatus = 'checking';
  else if (cmsData?.isOnline) cmsStatus = 'online';

  const banners: CmsBannerItem[] = cmsData?.banners || [];
  const translations: CmsTranslationItem[] = cmsData?.translations || [];
  const faqs: CmsFaqItem[] = cmsData?.faqs || [];

  const filteredBanners = banners.filter((item) => {
    const matchesSearch =
      !bannerSearch ||
      (item.title || '').toLowerCase().includes(bannerSearch.toLowerCase()) ||
      (item.linkUrl || '').toLowerCase().includes(bannerSearch.toLowerCase());
    const isActive = item.isActive !== false;
    const matchesStatus =
      bannerStatusFilter === 'ALL' ||
      (bannerStatusFilter === 'ACTIVE' && isActive) ||
      (bannerStatusFilter === 'INACTIVE' && !isActive);

    return matchesSearch && matchesStatus;
  });

  const filteredTranslations = translations.filter((item) => {
    const matchesSearch =
      !translationSearch ||
      (item.key || '').toLowerCase().includes(translationSearch.toLowerCase()) ||
      (item.vi || '').toLowerCase().includes(translationSearch.toLowerCase()) ||
      (item.en || '').toLowerCase().includes(translationSearch.toLowerCase());
    const matchesApp =
      appTargetFilter === 'ALL' ||
      (item.appTarget || 'ALL').toUpperCase() === appTargetFilter.toUpperCase();

    return matchesSearch && matchesApp;
  });

  const filteredFaqs = faqs.filter((item) => {
    const matchesSearch =
      !faqSearch ||
      (item.question || '').toLowerCase().includes(faqSearch.toLowerCase()) ||
      (item.answer || '').toLowerCase().includes(faqSearch.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(faqSearch.toLowerCase());
    const matchesApp =
      faqTargetFilter === 'ALL' ||
      (item.targetApp || 'ALL').toUpperCase() === faqTargetFilter.toUpperCase();

    return matchesSearch && matchesApp;
  });

  const bannerColumns = getBannerColumns();
  const translationColumns = getTranslationColumns();
  const faqColumns = getFaqColumns();

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        <PageHeader
          icon="🖼️"
          title="Quản Lý Nội Dung Động Strapi CMS"
          subtitle="Đồng bộ realtime Banner marketing, Từ điển đa ngôn ngữ (i18n) và Trung tâm trợ giúp FAQ từ Strapi CMS"
        />

        <Alert
          message={
            <Space align="center">
              <Text strong className="text-slate-800">
                Trạng Thái Máy Chủ Strapi Headless CMS (Port 1337):
              </Text>
              <Tag
                color={cmsStatus === 'online' ? 'success' : 'warning'}
                icon={<CheckCircleOutlined />}
              >
                {cmsStatus === 'online' ? 'ONLINE (HTTP 1337)' : 'OFFLINE / LOCAL STANDBY'}
              </Tag>
            </Space>
          }
          description={
            <div className="mt-2">
              <Text type="secondary">
                Tất cả nội dung được quản lý trực tiếp tại Strapi CMS Admin Panel và bọc Redis cache
                cho sub-10ms response time.
              </Text>
              <div className="mt-3">
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  href="http://localhost:1337/admin"
                  target="_blank"
                  size="large"
                >
                  Mở Trang Quản Trị Strapi CMS Admin Panel
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => checkCmsStatus()} className="ml-3">
                  Kiểm Tra Kết Nối
                </Button>
              </div>
            </div>
          }
          type={cmsStatus === 'online' ? 'info' : 'warning'}
          showIcon
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <MetricCard
              icon={<PictureOutlined />}
              label="Banner Đang Chạy"
              value={`${banners.length} Banner`}
              iconColor={adminDesignTokens.colors.primary}
            />
          </Col>
          <Col xs={24} sm={8}>
            <MetricCard
              icon={<GlobalOutlined />}
              label="Từ Điển i18n & Text Động"
              value={`${translations.length} Keys`}
              iconColor={adminDesignTokens.colors.statusApproved}
            />
          </Col>
          <Col xs={24} sm={8}>
            <MetricCard
              icon={<QuestionCircleOutlined />}
              label="Bài Viết Trợ Giúp FAQ"
              value={`${faqs.length} Câu Hỏi`}
              iconColor={adminDesignTokens.colors.statusPending}
            />
          </Col>
        </Row>

        <Card variant="borderless" className="rounded-xl shadow-xs">
          <Tabs
            items={[
              {
                key: 'banners',
                label: (
                  <span>
                    <PictureOutlined /> Banner Marketing ({filteredBanners.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" className="w-full" size="middle">
                    <SearchFilterBox
                      searchPlaceholder="Tìm kiếm tên Banner hoặc link..."
                      searchValue={bannerSearch}
                      onSearchChange={setBannerSearch}
                      filterLabel="Trạng thái:"
                      filterValue={bannerStatusFilter}
                      onFilterChange={setBannerStatusFilter}
                      filterOptions={CMS_BANNER_STATUS_FILTER_OPTIONS}
                    />
                    <DataTable<CmsBannerItem>
                      rowKey="id"
                      dataSource={filteredBanners}
                      columns={bannerColumns}
                      loading={isLoading}
                      emptyDescription="Chưa có banner quảng cáo"
                    />
                  </Space>
                ),
              },
              {
                key: 'translations',
                label: (
                  <span>
                    <GlobalOutlined /> Bản Dịch & Text Động (i18n) ({filteredTranslations.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" className="w-full" size="middle">
                    <SearchFilterBox
                      searchPlaceholder="Tìm kiếm theo Key, Tiếng Việt hoặc Tiếng Anh..."
                      searchValue={translationSearch}
                      onSearchChange={setTranslationSearch}
                      filterLabel="Ứng Dụng:"
                      filterValue={appTargetFilter}
                      onFilterChange={setAppTargetFilter}
                      filterOptions={CMS_APP_TARGET_FILTER_OPTIONS}
                    />
                    <DataTable<CmsTranslationItem>
                      rowKey="id"
                      dataSource={filteredTranslations}
                      columns={translationColumns}
                      loading={isLoading}
                      emptyDescription="Không tìm thấy bản dịch phù hợp"
                    />
                  </Space>
                ),
              },
              {
                key: 'faqs',
                label: (
                  <span>
                    <QuestionCircleOutlined /> Bài Viết Trợ Giúp FAQ ({filteredFaqs.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" className="w-full" size="middle">
                    <SearchFilterBox
                      searchPlaceholder="Tìm kiếm theo câu hỏi, câu trả lời hoặc danh mục..."
                      searchValue={faqSearch}
                      onSearchChange={setFaqSearch}
                      filterLabel="Ứng Dụng Hỗ Trợ:"
                      filterValue={faqTargetFilter}
                      onFilterChange={setFaqTargetFilter}
                      filterOptions={CMS_FAQ_TARGET_FILTER_OPTIONS}
                    />
                    <DataTable<CmsFaqItem>
                      rowKey="id"
                      dataSource={filteredFaqs}
                      columns={faqColumns}
                      loading={isLoading}
                      emptyDescription="Chưa có câu hỏi hỗ trợ FAQ"
                    />
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Space>
    </PageContainer>
  );
}
