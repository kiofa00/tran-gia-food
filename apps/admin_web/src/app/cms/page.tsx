'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Space, Alert, Table, Tabs } from 'antd';
import {
  ExportOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  PictureOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';

import { useCmsQuery } from '../../hooks/useCms';

const { Title, Text } = Typography;

export default function CmsManagementPage() {
  const { data: cmsData, isLoading, refetch: checkCmsStatus } = useCmsQuery();

  const cmsStatus = isLoading ? 'checking' : cmsData?.isOnline ? 'online' : 'offline';
  const banners = cmsData?.banners || [];
  const translations = cmsData?.translations || [];

  const bannerColumns = [
    { title: 'Tên Banner', dataIndex: 'title', key: 'title', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Đối Tượng Áp Dụng', dataIndex: 'target', key: 'target', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status', render: () => <Tag color="success">ĐANG HIỂN THỊ</Tag> },
    { title: 'Cập Nhật', dataIndex: 'updated', key: 'updated' },
  ];

  const translationColumns = [
    { title: 'Key Định Danh', dataIndex: 'key', key: 'key', render: (k: string) => <code>{k}</code> },
    { title: 'Ngôn Ngữ', dataIndex: 'locale', key: 'locale', render: (l: string) => <Tag color="purple">{l.toUpperCase()}</Tag> },
    { title: 'Ứng Dụng', dataIndex: 'app', key: 'app', render: (a: string) => <Tag color="gold">{a}</Tag> },
    { title: 'Giá Trị Hiển Thị (Text)', dataIndex: 'value', key: 'value', render: (v: string) => <Text strong>{v}</Text> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: adminDesignTokens.colors.background }}>
      <div style={{ padding: adminDesignTokens.padding.lg, maxWidth: 1400, margin: '0 auto' }}>
        <main style={{ width: '100%' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Status Alert Banner */}
            <Alert
              message={
                <Space>
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
                    Quản lý toàn bộ Banner Marketing, Từ điển đa ngôn ngữ (i18n), Thông báo hệ thống và Bài viết Hỗ trợ cho 4 ứng dụng.
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
                <Card style={{ borderRadius: adminDesignTokens.borderRadius.lg }}>
                  <Space align="center">
                    <PictureOutlined style={{ fontSize: 28, color: adminDesignTokens.colors.primary }} />
                    <div>
                      <Text type="secondary">Banner Đang Chạy</Text>
                      <Title level={3} style={{ margin: 0 }}>{banners.length} Banner</Title>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ borderRadius: adminDesignTokens.borderRadius.lg }}>
                  <Space align="center">
                    <GlobalOutlined style={{ fontSize: 28, color: adminDesignTokens.colors.statusApproved }} />
                    <div>
                      <Text type="secondary">Từ Điển i18n & Text Động</Text>
                      <Title level={3} style={{ margin: 0 }}>{translations.length} Keys</Title>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ borderRadius: adminDesignTokens.borderRadius.lg }}>
                  <Space align="center">
                    <QuestionCircleOutlined style={{ fontSize: 28, color: adminDesignTokens.colors.statusPending }} />
                    <div>
                      <Text type="secondary">Bài Viết Trợ Giúp FAQ</Text>
                      <Title level={3} style={{ margin: 0 }}>0 Câu Hỏi</Title>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* CMS Content Previews */}
            <Card title="Danh Mục Nội Dung Quản Lý Động" style={{ borderRadius: adminDesignTokens.borderRadius.lg }}>
              <Tabs
                items={[
                  {
                    key: 'banners',
                    label: (
                      <span>
                        <PictureOutlined /> Banner Marketing
                      </span>
                    ),
                    children: <Table dataSource={banners} columns={bannerColumns} rowKey="id" pagination={false} />,
                  },
                  {
                    key: 'translations',
                    label: (
                      <span>
                        <GlobalOutlined /> Bản Dịch & Text Động (i18n)
                      </span>
                    ),
                    children: <Table dataSource={translations} columns={translationColumns} rowKey="id" pagination={false} />,
                  },
                ]}
              />
            </Card>
          </Space>
        </main>
      </div>
    </div>
  );
}
