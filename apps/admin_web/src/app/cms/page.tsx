'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Space, Alert, Table, Tabs, Empty, Input, Select } from 'antd';
import {
  ExportOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  PictureOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';
import { useCmsQuery } from '../../hooks/useCms';
import { CmsBannerItem, CmsTranslationItem, CmsFaqItem } from '../../services/cms.service';
import { AppTargetTag, MetricCard, DataTable, SearchFilterBox, PageContainer, PageHeader } from '../../components';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CmsManagementPage() {
  const { data: cmsData, isLoading, refetch: checkCmsStatus } = useCmsQuery();

  // Banner Filters
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerStatusFilter, setBannerStatusFilter] = useState('ALL');

  // Translation Filters
  const [translationSearch, setTranslationSearch] = useState('');
  const [appTargetFilter, setAppTargetFilter] = useState('ALL');

  // FAQ Filters
  const [faqSearch, setFaqSearch] = useState('');
  const [faqTargetFilter, setFaqTargetFilter] = useState('ALL');

  const cmsStatus = isLoading ? 'checking' : cmsData?.isOnline ? 'online' : 'offline';
  const banners: CmsBannerItem[] = cmsData?.banners || [];
  const translations: CmsTranslationItem[] = cmsData?.translations || [];
  const faqs: CmsFaqItem[] = cmsData?.faqs || [];

  // Filter Banners
  const filteredBanners = banners.filter((item: CmsBannerItem) => {
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

  // Filter Translations
  const filteredTranslations = translations.filter((item: CmsTranslationItem) => {
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

  // Filter FAQs
  const filteredFaqs = faqs.filter((item: CmsFaqItem) => {
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

  const bannerColumns = [
    {
      title: 'Tên Banner / Chiến Dịch',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: CmsBannerItem, b: CmsBannerItem) => (a.title || '').localeCompare(b.title || ''),
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Link / Deeplink Chuyển Hướng',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      render: (link?: string) => (link ? <Text type="secondary">{link}</Text> : <Text type="secondary">—</Text>),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active !== false ? 'success' : 'default'}>
          {active !== false ? 'ĐANG HIỂN THỊ' : 'TẠM DỪNG'}
        </Tag>
      ),
    },
  ];

  const translationColumns = [
    {
      title: 'Key Định Danh',
      dataIndex: 'key',
      key: 'key',
      sorter: (a: CmsTranslationItem, b: CmsTranslationItem) => (a.key || '').localeCompare(b.key || ''),
      render: (k: string) => <code>{k}</code>,
    },
    {
      title: 'Tiếng Việt (VI)',
      dataIndex: 'vi',
      key: 'vi',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Tiếng Anh (EN)',
      dataIndex: 'en',
      key: 'en',
      render: (v: string) => <Text type="secondary">{v || 'N/A'}</Text>,
    },
    {
      title: 'Ứng Dụng (App Target)',
      dataIndex: 'appTarget',
      key: 'appTarget',
      render: (target?: string) => <AppTargetTag target={target} />,
    },
  ];

  const faqColumns = [
    {
      title: 'Câu Hỏi (Question)',
      dataIndex: 'question',
      key: 'question',
      sorter: (a: CmsFaqItem, b: CmsFaqItem) => (a.question || '').localeCompare(b.question || ''),
      render: (q: string) => <Text strong style={{ color: adminDesignTokens.colors.primary }}>{q}</Text>,
    },
    {
      title: 'Câu Trả Lời (Answer)',
      dataIndex: 'answer',
      key: 'answer',
      render: (a: string) => <Text type="secondary">{a}</Text>,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat?: string) => <Tag color="geekblue">{cat || 'GENERAL'}</Tag>,
    },
    {
      title: 'Ứng Dụng Hỗ Trợ',
      dataIndex: 'targetApp',
      key: 'targetApp',
      render: (target?: string) => <AppTargetTag target={target} />,
    },
  ];

  const tablePaginationConfig = {
    defaultPageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} mục`,
  };

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <PageHeader
          icon="🖼️"
          title="Quản Lý Nội Dung Động Strapi CMS"
          subtitle="Đồng bộ realtime Banner marketing, Từ điển đa ngôn ngữ (i18n) và Trung tâm trợ giúp FAQ từ Strapi CMS"
        />

            {/* Status Alert Banner */}
            <Alert
              message={
                <Space align="center">
                  <Text strong style={{ color: adminDesignTokens.colors.textPrimary }}>
                    Trạng Thái Máy Chủ Strapi Headless CMS (Port 1337):
                  </Text>
                  <Tag color={cmsStatus === 'online' ? 'success' : 'warning'} icon={<CheckCircleOutlined />}>
                    {cmsStatus === 'online' ? 'ONLINE (HTTP 1337)' : 'OFFLINE / LOCAL STANDBY'}
                  </Tag>
                </Space>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    Tất cả nội dung được quản lý trực tiếp tại Strapi CMS Admin Panel và bọc Redis cache cho sub-10ms response time.
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    <Button
                      type="primary"
                      icon={<ExportOutlined />}
                      href="http://localhost:1337/admin"
                      target="_blank"
                      size="large"
                    >
                      Mở Trang Quản Trị Strapi CMS Admin Panel
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={() => checkCmsStatus()} style={{ marginLeft: 12 }}>
                      Kiểm Tra Kết Nối
                    </Button>
                  </div>
                </div>
              }
              type={cmsStatus === 'online' ? 'info' : 'warning'}
              showIcon
            />

            {/* Quick Metrics */}
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

            {/* CMS Content Previews Tabs */}
            <Card variant="borderless" style={{ borderRadius: adminDesignTokens.borderRadius.lg, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <SearchFilterBox
                          searchPlaceholder="Tìm kiếm tên Banner hoặc link..."
                          searchValue={bannerSearch}
                          onSearchChange={setBannerSearch}
                          filterLabel="Trạng thái:"
                          filterValue={bannerStatusFilter}
                          onFilterChange={setBannerStatusFilter}
                          filterOptions={[
                            { value: 'ALL', label: 'Tất Cả Banner' },
                            { value: 'ACTIVE', label: 'Đang Hiển Thị' },
                            { value: 'INACTIVE', label: 'Tạm Dừng' },
                          ]}
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
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <SearchFilterBox
                          searchPlaceholder="Tìm kiếm theo Key, Tiếng Việt hoặc Tiếng Anh..."
                          searchValue={translationSearch}
                          onSearchChange={setTranslationSearch}
                          filterLabel="Ứng Dụng:"
                          filterValue={appTargetFilter}
                          onFilterChange={setAppTargetFilter}
                          filterOptions={[
                            { value: 'ALL', label: 'Tất Cả Ứng Dụng (ALL)' },
                            { value: 'CUSTOMER', label: 'Customer App' },
                            { value: 'SHIPPER', label: 'Shipper App' },
                            { value: 'RESTAURANT', label: 'Restaurant App' },
                            { value: 'ADMIN_WEB', label: 'Admin Web' },
                          ]}
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
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <SearchFilterBox
                          searchPlaceholder="Tìm kiếm theo câu hỏi, câu trả lời hoặc danh mục..."
                          searchValue={faqSearch}
                          onSearchChange={setFaqSearch}
                          filterLabel="Ứng Dụng Hỗ Trợ:"
                          filterValue={faqTargetFilter}
                          onFilterChange={setFaqTargetFilter}
                          filterOptions={[
                            { value: 'ALL', label: 'Tất Cả Ứng Dụng (ALL)' },
                            { value: 'CUSTOMER', label: 'Customer App' },
                            { value: 'SHIPPER', label: 'Shipper App' },
                            { value: 'RESTAURANT', label: 'Restaurant App' },
                          ]}
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
