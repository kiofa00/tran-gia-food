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
import { VehicleBadge, PlateBadge, PageContainer, PageHeader, SearchFilterBox, DataTable } from '../components';
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
    <PageContainer>
      <PageHeader
        icon="🍜"
        title="Tran Gia Food — Dashboard Quản Trị"
        subtitle="Tích hợp API Realtime theo dõi doanh thu, GMV & tài xế toàn quốc"
        action={
          <Button type="primary" ghost icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} className="font-semibold">
            Làm mới số liệu
          </Button>
        }
      />

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="rounded-xl shadow-xs">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><DollarOutlined className="text-orange-500 mr-2" />Doanh Thu Hoa Hồng (Sàn)</Text>}
                value={stats.totalPlatformRevenue}
                suffix="đ"
                valueStyle={{ color: '#f97316', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="rounded-xl shadow-xs">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><ShoppingOutlined className="text-green-600 mr-2" />Tổng GMV Đặt Đồ Ăn</Text>}
                value={stats.totalFoodGmv}
                suffix="đ"
                valueStyle={{ color: '#16a34a', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="rounded-xl shadow-xs">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><CarOutlined className="text-blue-500 mr-2" />Tổng Cước Phí Shipping</Text>}
                value={stats.totalShipGmv}
                suffix="đ"
                valueStyle={{ color: '#3b82f6', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="rounded-xl shadow-xs">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><UserOutlined className="text-purple-600 mr-2" />Đội Ngũ Tài Xế Online</Text>}
                value={stats.totalShippers}
                suffix="Tài xế"
                valueStyle={{ color: '#9333ea', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <SearchFilterBox
        searchPlaceholder="Tìm theo tên hoặc SĐT tài xế..."
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel="Lọc trạng thái eKYC:"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'ALL', label: 'Tất cả trạng thái' },
          { value: 'PENDING', label: 'Chờ duyệt eKYC' },
          { value: 'APPROVED', label: 'Đã duyệt eKYC' },
          { value: 'REJECTED', label: 'Từ chối' },
        ]}
      />

      <Card title="📋 Danh Sách Shipper Chờ Duyệt eKYC" variant="borderless" className="rounded-xl shadow-xs">
        <DataTable<PendingShipperRecord>
          rowKey="key"
          columns={columns}
          dataSource={filteredPendingShippers}
          loading={loading}
          scroll={{ x: 1100 }}
          emptyDescription="Không có tài xế chờ duyệt eKYC"
        />
      </Card>
    </PageContainer>
  );
}
