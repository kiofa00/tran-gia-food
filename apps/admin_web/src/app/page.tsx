'use client';

import React from 'react';
import { Card, Table, Tag, Button, Row, Col, Statistic, Space, Typography } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const columns = [
    {
      title: 'Họ & Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Loại Xe',
      dataIndex: 'vehicle',
      key: 'vehicle',
    },
    {
      title: 'Biển Số Xe',
      dataIndex: 'plate',
      key: 'plate',
      render: (plate: string) => <Tag color="blue">{plate}</Tag>,
    },
    {
      title: 'Trạng Thái eKYC',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="primary" icon={<CheckCircleOutlined />} style={{ backgroundColor: adminDesignTokens.colors.statusApproved }}>
            Duyệt eKYC
          </Button>
          <Button danger icon={<CloseCircleOutlined />}>
            Từ Chối
          </Button>
        </Space>
      ),
    },
  ];

  const dataSource = [
    {
      key: '1',
      name: 'Nguyễn Văn Cường',
      phone: '0912 345 678',
      vehicle: 'Xe Máy (Honda Wave)',
      plate: '59P1-999.88',
      status: 'PENDING',
    },
    {
      key: '2',
      name: 'Lê Hoàng Nam',
      phone: '0987 654 321',
      vehicle: 'Xe Máy (Yamaha Exciter)',
      plate: '59X2-123.45',
      status: 'PENDING',
    },
  ];

  return (
    <div style={{ padding: adminDesignTokens.padding.lg }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
          🍜 Tran Gia Food — Dashboard Quản Trị
        </Title>
        <Text type="secondary">Tổng quan tình hình kinh doanh & hoạt động hệ thống toàn quốc</Text>
      </div>

      {/* Antd Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng Doanh Thu Platform"
              value={125450000}
              precision={0}
              suffix="đ"
              prefix={<DollarOutlined style={{ color: adminDesignTokens.colors.primary }} />}
              valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
            />
            <Text type="success" style={{ fontWeight: 600 }}>▲ +18.5% so với tháng trước</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng GMV Đặt Hàng"
              value={627250000}
              precision={0}
              suffix="đ"
              prefix={<ShoppingOutlined style={{ color: adminDesignTokens.colors.primary }} />}
              valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
            />
            <Text type="success" style={{ fontWeight: 600 }}>▲ +24.2% GMV đồ ăn</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng Số Đơn Hàng"
              value={4820}
              suffix="đơn"
              prefix={<UserOutlined style={{ color: adminDesignTokens.colors.primary }} />}
              valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
            />
            <Text style={{ color: adminDesignTokens.colors.primary, fontWeight: 600 }}>● 98.2% giao thành công</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Shipper Đang Hoạt Động"
              value={154}
              suffix="tài xế"
              prefix={<CarOutlined style={{ color: adminDesignTokens.colors.primary }} />}
              valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
            />
            <Text type="warning" style={{ fontWeight: 600 }}>⏳ 12 hồ sơ chờ duyệt eKYC</Text>
          </Card>
        </Col>
      </Row>

      {/* Antd Shipper Table */}
      <Card title="📋 Danh Sách Shipper Chờ Duyệt eKYC" bordered={false}>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </Card>
    </div>
  );
}
