'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Button, Space, Skeleton, message } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';
import { mapKycStatus } from '../utils/formatters';
import { useDashboardStatsQuery, usePendingShippersQuery, useVerifyShipperKycMutation } from '../hooks/useAdmin';

const { Title, Text } = Typography;

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalShippers: number;
  totalOrders: number;
  totalPlatformRevenue: number;
  totalFoodGmv: number;
  totalShipGmv: number;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStatsQuery();
  const { data: pendingShippersRaw, isLoading: shippersLoading, refetch: refetchShippers } = usePendingShippersQuery();
  const verifyKycMutation = useVerifyShipperKycMutation();

  const loading = statsLoading || shippersLoading;

  const pendingShippers = (pendingShippersRaw || []).map((item: any) => ({
    key: item.id,
    id: item.id,
    name: item.user?.name || 'Tài Xế Chưa Đặt Tên',
    phone: item.user?.phone || 'N/A',
    vehicle: item.vehicleType || 'Xe Máy',
    plate: item.licensePlate || 'N/A',
    status: item.kycStatus || 'PENDING',
  }));

  const handleApproveKyc = (id: string, name: string) => {
    verifyKycMutation.mutate(
      { id, action: 'approve' },
      {
        onSuccess: () => {
          message.success(`Đã duyệt eKYC thành công cho tài xế ${name}!`);
        },
        onError: () => {
          message.error('Không thể cập nhật trạng thái eKYC');
        },
      },
    );
  };

  const handleRejectKyc = (id: string, name: string) => {
    verifyKycMutation.mutate(
      { id, action: 'reject' },
      {
        onSuccess: () => {
          message.error(`Đã từ chối eKYC của tài xế ${name}.`);
        },
        onError: () => {
          message.error('Không thể cập nhật trạng thái eKYC');
        },
      },
    );
  };

  const handleRefresh = () => {
    refetchStats();
    refetchShippers();
  };

  const columns = [
    {
      title: 'Họ & Tên',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => <Text style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Loại Xe',
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 220,
      render: (text: string) => <Text style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Biển Số Xe',
      dataIndex: 'plate',
      key: 'plate',
      width: 150,
      render: (plate: string) => <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>{plate}</Tag>,
    },
    {
      title: 'Trạng Thái eKYC',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (status: string) => {
        const meta = mapKycStatus(status);
        return (
          <Tag icon={<ClockCircleOutlined />} color={meta.tagColor} style={{ fontSize: 13, padding: '2px 10px', whiteSpace: 'nowrap' }}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 260,
      render: (record: { id: string; name: string }) => (
        <Space size="small" style={{ whiteSpace: 'nowrap' }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: adminDesignTokens.colors.statusApproved }}
            onClick={() => handleApproveKyc(record.id, record.name)}
          >
            Duyệt eKYC
          </Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectKyc(record.id, record.name)}>
            Từ Chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: adminDesignTokens.padding.lg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
            🍜 Tran Gia Food — Dashboard Quản Trị
          </Title>
          <Text type="secondary">Tích hợp API Realtime theo dõi doanh thu, GMV & tài xế toàn quốc</Text>
        </div>
        <Button type="primary" ghost icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} style={{ fontWeight: 600 }}>
          Làm mới số liệu
        </Button>
      </div>

      {/* Antd Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {loading || !stats
          ? [1, 2, 3, 4].map((key) => (
              <Col xs={24} sm={12} lg={6} key={key}>
                <Card variant="borderless">
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Card>
              </Col>
            ))
          : (
              <>
                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless">
                    <Statistic
                      title="Tổng Doanh Thu Platform"
                      value={stats.totalPlatformRevenue}
                      precision={0}
                      suffix="đ"
                      prefix={<DollarOutlined style={{ color: adminDesignTokens.colors.primary }} />}
                      valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless">
                    <Statistic
                      title="Tổng GMV Đặt Món"
                      value={stats.totalFoodGmv}
                      precision={0}
                      suffix="đ"
                      prefix={<ShoppingOutlined style={{ color: adminDesignTokens.colors.primary }} />}
                      valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless">
                    <Statistic
                      title="Tổng Số Đơn Hàng"
                      value={stats.totalOrders}
                      suffix="đơn"
                      prefix={<UserOutlined style={{ color: adminDesignTokens.colors.primary }} />}
                      valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless">
                    <Statistic
                      title="Shipper Đang Hoạt Động"
                      value={stats.totalShippers}
                      suffix="tài xế"
                      prefix={<CarOutlined style={{ color: adminDesignTokens.colors.primary }} />}
                      valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
                    />
                  </Card>
                </Col>
              </>
            )}
      </Row>

      {/* Antd Shipper Table */}
      <Card title="📋 Danh Sách Shipper Chờ Duyệt eKYC" variant="borderless">
        <Table columns={columns} dataSource={pendingShippers} loading={loading} pagination={false} scroll={{ x: 1100 }} />
      </Card>
    </div>
  );
}
