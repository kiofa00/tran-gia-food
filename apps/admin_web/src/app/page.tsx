'use client';

import { useState } from 'react';

import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd';

import {
  DataTable,
  PageContainer,
  PageHeader,
  PlateBadge,
  SearchFilterBox,
  VehicleBadge,
} from '@/components';
import {
  useDashboardStatsQuery,
  usePendingShippersQuery,
  useVerifyShipperKycMutation,
} from '@/hooks/useAdmin';
import { DashboardOverviewStats } from '@/services/admin.service';
import { adminDesignTokens } from '@/theme/tokens';
import { PendingShipperRecord } from '@/types';
import { mapKycStatus, mapVehicleType } from '@/utils/formatters';

const { Text } = Typography;

export default function AdminDashboardPage() {
  const { message } = App.useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStatsQuery();
  const {
    data: rawShippersData,
    isLoading: shippersLoading,
    refetch: refetchShippers,
  } = usePendingShippersQuery();
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

  const pendingShippers: PendingShipperRecord[] = (rawShippersData || []).map(
    (item, idx: number) => {
      const rawStatus = (
        item.ekycStatus ||
        item.kycStatus ||
        item.status ||
        'PENDING'
      ).toUpperCase();
      const normalizedStatus =
        rawStatus === 'VERIFIED' || rawStatus === 'APPROVED' ? 'APPROVED' : rawStatus;

      return {
        key: item.id || String(idx + 1),
        id: item.id || `S${idx + 1}`,
        name: item.user?.name || item.name || '',
        phone: item.user?.phone || item.phone || '',
        vehicle: mapVehicleType(String(item.vehicle || item.vehicleType || '')),
        plate: item.plate || item.licensePlate || '',
        status: normalizedStatus,
        rawStatus,
      };
    },
  );

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
      render: (id: string) => (
        <Text strong className="text-orange-500 whitespace-nowrap">
          {id}
        </Text>
      ),
    },
    {
      title: 'Họ & Tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Text strong className="whitespace-nowrap">
          {name}
        </Text>
      ),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => <Text className="whitespace-nowrap">{text}</Text>,
    },
    {
      title: 'Loại Xe',
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 180,
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) =>
        a.vehicle.localeCompare(b.vehicle),
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
      sorter: (a: PendingShipperRecord, b: PendingShipperRecord) =>
        a.status.localeCompare(b.status),
      render: (status: string) => {
        const meta = mapKycStatus(status);

        return (
          <Tag
            icon={<ClockCircleOutlined />}
            color={meta.tagColor}
            className="text-xs px-2.5 py-0.5 whitespace-nowrap"
          >
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
        <Space size="small" className="whitespace-nowrap">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            className="bg-green-600 hover:bg-green-500 border-none"
            onClick={() => handleApproveKyc(record.id, record.name)}
          >
            Duyệt eKYC
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleRejectKyc(record.id, record.name)}
          >
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
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            className="font-semibold"
          >
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
                title={
                  <Text type="secondary">
                    <DollarOutlined className="text-orange-500 mr-2" />
                    Doanh Thu Hoa Hồng (Sàn)
                  </Text>
                }
                value={stats.totalPlatformRevenue}
                suffix="đ"
                valueStyle={{
                  color: adminDesignTokens.colors.statOrange,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
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
                title={
                  <Text type="secondary">
                    <ShoppingOutlined className="text-green-600 mr-2" />
                    Tổng GMV Đặt Đồ Ăn
                  </Text>
                }
                value={stats.totalFoodGmv}
                suffix="đ"
                valueStyle={{
                  color: adminDesignTokens.colors.statGreen,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
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
                title={
                  <Text type="secondary">
                    <CarOutlined className="text-blue-500 mr-2" />
                    Tổng Cước Phí Shipping
                  </Text>
                }
                value={stats.totalShipGmv}
                suffix="đ"
                valueStyle={{
                  color: adminDesignTokens.colors.statBlue,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
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
                title={
                  <Text type="secondary">
                    <UserOutlined className="text-purple-600 mr-2" />
                    Đội Ngũ Tài Xế Online
                  </Text>
                }
                value={stats.totalShippers}
                suffix="Tài xế"
                valueStyle={{
                  color: adminDesignTokens.colors.statPurple,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
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

      <Card
        title="📋 Danh Sách Shipper Chờ Duyệt eKYC"
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
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
