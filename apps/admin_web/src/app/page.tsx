'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Button, Space, Skeleton, Empty, App, Input, Select } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';
import { mapKycStatus, mapVehicleType } from '../utils/formatters';
import { VehicleBadge, PlateBadge } from '../components';
import { useDashboardStatsQuery, usePendingShippersQuery, useVerifyShipperKycMutation } from '../hooks/useAdmin';
import { DashboardOverviewStats } from '../services/admin.service';
import { PendingShipperRecord } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminDashboardPage() {
  const { message } = App.useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useDashboardStatsQuery();
  const { data: rawShippersData, isLoading: shippersLoading, refetch: refetchShippers } = usePendingShippersQuery();
  const verifyKycMutation = useVerifyShipperKycMutation();

  const loading = statsLoading || shippersLoading;

  const stats: DashboardOverviewStats = statsData || {
    totalUsers: 0,
    totalRestaurants: 0,
    totalShippers: 0,
    totalOrders: 0,
    totalPlatformRevenue: 0,
    totalFoodGmv: 0,
    totalShipGmv: 0,
  };

  const pendingShippers: PendingShipperRecord[] = (rawShippersData || []).map((item, idx: number) => {
    const rawStatus = (item.ekycStatus || item.kycStatus || item.status || 'PENDING').toUpperCase();
    const normalizedStatus = (rawStatus === 'VERIFIED' || rawStatus === 'APPROVED') ? 'APPROVED' : rawStatus;
    return {
      key: item.id || String(idx + 1),
      id: item.id || `S${idx + 1}`,
      name: item.user?.name || item.name || '',
      phone: item.user?.phone || item.phone || '',
      vehicle: mapVehicleType(item.vehicle || item.vehicleType),
      plate: item.plate || item.licensePlate || '',
      status: normalizedStatus,
      rawStatus,
    };
  });

  const filteredPendingShippers = pendingShippers.filter((item: PendingShipperRecord) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      item.status === statusFilter ||
      (statusFilter === 'APPROVED' && (item.status === 'APPROVED' || item.status === 'VERIFIED'));
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    refetchStats();
    refetchShippers();
    message.success('Đã cập nhật số liệu mới nhất!');
  };

  const handleApproveKyc = (id: string, name: string) => {
    verifyKycMutation.mutate(
      { id, action: 'approve' },
      {
        onSuccess: () => {
          message.success(`Đã duyệt hồ sơ eKYC cho tài xế ${name} thành công!`);
        },
        onError: () => {
          message.error('Duyệt eKYC thất bại');
        },
      },
    );
  };

  const handleRejectKyc = (id: string, name: string) => {
    verifyKycMutation.mutate(
      { id, action: 'reject' },
      {
        onSuccess: () => {
          message.info(`Đã từ chối eKYC của tài xế ${name}`);
        },
        onError: () => {
          message.error('Từ chối eKYC thất bại');
        },
      },
    );
  };

  const columns = [
    {
      title: 'Mã Tài Xế',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) => a.id.localeCompare(b.id),
      render: (id: string) => <Text strong style={{ color: adminDesignTokens.colors.primary, whiteSpace: 'nowrap' }}>{id}</Text>,
    },
    {
      title: 'Họ & Tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{name}</Text>,
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
      width: 180,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) => a.vehicle.localeCompare(b.vehicle),
      render: (text: string) => <VehicleBadge vehicle={text} />,
    },
    {
      title: 'Biển Số Xe',
      dataIndex: 'plate',
      key: 'plate',
      width: 150,
      render: (plate: string) => <PlateBadge plate={plate} />,
    },
    {
      title: 'Trạng Thái eKYC',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) => a.status.localeCompare(b.status),
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
      render: (record: PendingShipperRecord) => (
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><DollarOutlined style={{ color: adminDesignTokens.colors.primary, marginRight: 8 }} />Doanh Thu Hoa Hồng (Sàn)</Text>}
                value={stats.totalPlatformRevenue}
                suffix="đ"
                valueStyle={{ color: adminDesignTokens.colors.primary, fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><ShoppingOutlined style={{ color: '#52C41A', marginRight: 8 }} />Tổng GMV Đặt Đồ Ăn</Text>}
                value={stats.totalFoodGmv}
                suffix="đ"
                valueStyle={{ color: '#52C41A', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><CarOutlined style={{ color: '#1890FF', marginRight: 8 }} />Tổng Cước Phí Shipping</Text>}
                value={stats.totalShipGmv}
                suffix="đ"
                valueStyle={{ color: '#1890FF', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><UserOutlined style={{ color: '#722ED1', marginRight: 8 }} />Đội Ngũ Tài Xế Online</Text>}
                value={stats.totalShippers}
                suffix="Tài xế"
                valueStyle={{ color: '#722ED1', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card className="table-filter-card" variant="borderless" style={{ marginBottom: 16, borderRadius: 12 }}>
        <div className="table-filter-toolbar">
          <Input
            placeholder="Tìm theo tên hoặc SĐT tài xế..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search-input"
          />
          <div className="filter-select-group">
            <Text type="secondary" style={{ whiteSpace: 'nowrap' }}><FilterOutlined /> Lọc trạng thái eKYC:</Text>
            <Select defaultValue="ALL" value={statusFilter} onChange={(val) => setStatusFilter(val)} style={{ minWidth: 160 }}>
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="PENDING">Chờ duyệt eKYC</Option>
              <Option value="APPROVED">Đã duyệt eKYC</Option>
              <Option value="REJECTED">Từ chối</Option>
            </Select>
          </div>
        </div>
      </Card>

      <Card title="📋 Danh Sách Shipper Chờ Duyệt eKYC" variant="borderless">
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filteredPendingShippers}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} mục`,
          }}
          scroll={{ x: 1100 }}
          style={{ minHeight: 260 }}
          locale={{ emptyText: loading ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có tài xế chờ duyệt eKYC" /> }}
        />
      </Card>
    </div>
  );
}
