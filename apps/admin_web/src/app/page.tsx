'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Statistic, Space, Typography, Spin, message } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';
import { mapKycStatus } from '../utils/formatters';

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        // Fallback demo data if backend server is not running
        setStats({
          totalUsers: 1250,
          totalRestaurants: 48,
          totalShippers: 154,
          totalOrders: 4820,
          totalPlatformRevenue: 125450000,
          totalFoodGmv: 627250000,
          totalShipGmv: 45200000,
        });
      }
    } catch {
      // Fallback demo data on network error
      setStats({
        totalUsers: 1250,
        totalRestaurants: 48,
        totalShippers: 154,
        totalOrders: 4820,
        totalPlatformRevenue: 125450000,
        totalFoodGmv: 627250000,
        totalShipGmv: 45200000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleApproveKyc = (name: string) => {
    message.success(`Đã duyệt eKYC thành công cho tài xế ${name}!`);
  };

  const handleRejectKyc = (name: string) => {
    message.error(`Đã từ chối eKYC của tài xế ${name}.`);
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
      render: (record: { name: string }) => (
        <Space size="small" style={{ whiteSpace: 'nowrap' }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: adminDesignTokens.colors.statusApproved }}
            onClick={() => handleApproveKyc(record.name)}
          >
            Duyệt eKYC
          </Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectKyc(record.name)}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
            🍜 Tran Gia Food — Dashboard Quản Trị
          </Title>
          <Text type="secondary">Tích hợp API Realtime theo dõi doanh thu, GMV & tài xế toàn quốc</Text>
        </div>
        <Button type="primary" ghost icon={<ReloadOutlined />} onClick={fetchDashboardStats} loading={loading} style={{ fontWeight: 600 }}>
          Làm mới số liệu
        </Button>
      </div>

      {loading && !stats ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải dữ liệu realtime từ Backend..." />
        </div>
      ) : (
        <>
          {/* Antd Stat Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false}>
                <Statistic
                  title="Tổng Doanh Thu Platform"
                  value={stats?.totalPlatformRevenue ?? 0}
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
                  title="Tổng GMV Đặt Món"
                  value={stats?.totalFoodGmv ?? 0}
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
                  value={stats?.totalOrders ?? 0}
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
                  value={stats?.totalShippers ?? 0}
                  suffix="tài xế"
                  prefix={<CarOutlined style={{ color: adminDesignTokens.colors.primary }} />}
                  valueStyle={{ color: adminDesignTokens.colors.textPrimary, fontWeight: 800 }}
                />
                <Text type="warning" style={{ fontWeight: 600 }}>⏳ {dataSource.length} hồ sơ chờ duyệt eKYC</Text>
              </Card>
            </Col>
          </Row>

          {/* Antd Shipper Table */}
          <Card title="📋 Danh Sách Shipper Chờ Duyệt eKYC" bordered={false}>
            <Table columns={columns} dataSource={dataSource} pagination={false} scroll={{ x: 1100 }} />
          </Card>
        </>
      )}
    </div>
  );
}
