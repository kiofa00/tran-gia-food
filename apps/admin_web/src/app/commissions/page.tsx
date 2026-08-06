'use client';

import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Statistic, Space, Typography, Badge, Empty, App, Skeleton, Input, Select } from 'antd';
import {
  BankOutlined,
  DollarOutlined,
  ShoppingOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';
import { formatCurrency } from '../../utils/formatters';
import { PageContainer, PageHeader, SearchFilterBox, DataTable } from '../../components';

const { Title, Text } = Typography;
const { Option } = Select;

import { CommissionRecord } from '../../types';
import { useCommissionsQuery } from '../../hooks/useCommissions';

export default function CommissionsPage() {
  const { message } = App.useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawCommissions, isLoading: loading } = useCommissionsQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const rawList = Array.isArray(rawCommissions) ? rawCommissions : (rawCommissions?.data || []);
  const commissions: CommissionRecord[] = rawList.map((item: Record<string, unknown>, idx: number) => ({
    key: String(item.id || item.key || idx + 1),
    orderId: String(item.orderId || `ORD-${item.id || idx + 1}`),
    restaurantName: String(item.restaurantName || item.restaurant || 'Quán ăn'),
    foodAmount: Number(item.foodAmount || item.totalFoodGmv) || 0,
    shipAmount: Number(item.shipAmount || item.shipFee) || 0,
    restaurantShare: Number(item.restaurantShare) || 0,
    shipperShare: Number(item.shipperShare) || 0,
    platformShare: Number(item.platformShare || item.platformCommission) || 0,
    status: (item.status === 'PAID' || item.status === 'PROCESSED') ? 'PROCESSED' : 'PENDING',
    createdAt: String(item.createdAt || ''),
  }));

  const filteredCommissions = commissions.filter((item) => {
    const matchesSearch =
      !search ||
      item.orderId.toLowerCase().includes(search.toLowerCase()) ||
      item.restaurantName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPlatformCommission = filteredCommissions.reduce((sum, item) => sum + item.platformShare, 0);
  const totalRestaurantRevenue = filteredCommissions.reduce((sum, item) => sum + item.restaurantShare, 0);
  const totalShipperDelivery = filteredCommissions.reduce((sum, item) => sum + item.shipperShare, 0);

  const handleProcessPayout = () => {
    message.success('Đã hoàn tất quyết toán hoa hồng & giải ngân vào Ví đối tác thành công!');
  };

  const columns = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 140,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.orderId.localeCompare(b.orderId),
      render: (id: string) => <Text strong style={{ color: adminDesignTokens.colors.primary, whiteSpace: 'nowrap' }}>{id}</Text>,
    },
    {
      title: 'Tên Quán Ăn',
      dataIndex: 'restaurantName',
      key: 'restaurantName',
      width: 200,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.restaurantName.localeCompare(b.restaurantName),
      render: (text: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Tiền Món (GMV)',
      dataIndex: 'foodAmount',
      key: 'foodAmount',
      width: 150,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.foodAmount - b.foodAmount,
      render: (val: number) => <Text style={{ whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Phí Ship',
      dataIndex: 'shipAmount',
      key: 'shipAmount',
      width: 130,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.shipAmount - b.shipAmount,
      render: (val: number) => <Text style={{ whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Ví Quán (85%)',
      dataIndex: 'restaurantShare',
      key: 'restaurantShare',
      width: 150,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.restaurantShare - b.restaurantShare,
      render: (val: number) => <Text style={{ color: '#52C41A', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Ví Shipper (100% Ship)',
      dataIndex: 'shipperShare',
      key: 'shipperShare',
      width: 180,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.shipperShare - b.shipperShare,
      render: (val: number) => <Text style={{ color: '#1890FF', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Hoa Hồng Sàn (15%)',
      dataIndex: 'platformShare',
      key: 'platformShare',
      width: 170,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.platformShare - b.platformShare,
      render: (val: number) => <Text className="text-orange-500 font-bold whitespace-nowrap">{formatCurrency(val)}</Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.status.localeCompare(b.status),
      render: (status: string) => (
        <Tag color={status === 'PROCESSED' ? 'success' : 'warning'} icon={status === 'PROCESSED' ? <CheckCircleOutlined /> : <SyncOutlined spin />} className="whitespace-nowrap">
          {status === 'PROCESSED' ? 'Đã Giải Ngân' : 'Chờ Quyết Toán'}
        </Tag>
      ),
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.createdAt.localeCompare(b.createdAt),
      render: (date: string) => <Text type="secondary" className="whitespace-nowrap">{date}</Text>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        icon="💰"
        title="Hoa Hồng Sàn & Giải Ngân Ví Đối Tác"
        subtitle="Phân bổ doanh thu tự động giữa Quán ăn (85%), Shipper (100% phí ship) & Sàn Tran Gia (15%)"
        action={
          <Button
            type="primary"
            icon={<BankOutlined />}
            size="large"
            onClick={handleProcessPayout}
            className="bg-green-600 font-semibold border-none"
          >
            Duyệt Quyết Toán Ví
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="rounded-xl shadow-xs">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><PercentageOutlined className="text-orange-500 mr-2" />Tổng Phí Hoa Hồng Thu Được</Text>}
                value={totalPlatformCommission}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: '#f97316', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="rounded-xl shadow-xs">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><ShoppingOutlined className="text-green-600 mr-2" />Doanh Thu Chuyển Ví Quán</Text>}
                value={totalRestaurantRevenue}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: '#16a34a', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="rounded-xl shadow-xs">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><DollarOutlined className="text-blue-500 mr-2" />Phí Giao Hàng Thu Hộ Shipper</Text>}
                value={totalShipperDelivery}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: '#3b82f6', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Search & Filter Toolbar */}
      <SearchFilterBox
        searchPlaceholder="Tìm theo mã đơn hoặc tên quán..."
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel="Lọc trạng thái:"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'ALL', label: 'Tất cả trạng thái' },
          { value: 'PROCESSED', label: 'Đã Giải Ngân' },
          { value: 'PENDING', label: 'Chờ Quyết Toán' },
        ]}
      />

      {/* Commission Table */}
      <Card title="📋 Bảng Chi Tiết Phân Bổ Hoa Hồng Đơn Hàng" variant="borderless" className="rounded-xl shadow-xs">
        <DataTable<CommissionRecord>
          rowKey="key"
          columns={columns}
          dataSource={filteredCommissions}
          loading={loading}
          scroll={{ x: 1200 }}
          emptyDescription="Chưa có dữ liệu hạch toán hoa hồng"
        />
      </Card>
    </PageContainer>
  );
}
