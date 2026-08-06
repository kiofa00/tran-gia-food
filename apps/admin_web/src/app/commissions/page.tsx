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
      render: (val: number) => <Text style={{ color: adminDesignTokens.colors.primary, fontWeight: 700, whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      sorter: (a: CommissionRecord, b: CommissionRecord) => a.status.localeCompare(b.status),
      render: (status: string) => (
        <Tag color={status === 'PROCESSED' ? 'success' : 'warning'} icon={status === 'PROCESSED' ? <CheckCircleOutlined /> : <SyncOutlined spin />} style={{ whiteSpace: 'nowrap' }}>
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
      render: (date: string) => <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>{date}</Text>,
    },
  ];

  return (
    <div style={{ padding: adminDesignTokens.padding.lg }}>
      {/* Header Title & Bulk Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
            💰 Hoa Hồng Sàn & Giải Ngân Ví Đối Tác
          </Title>
          <Text type="secondary">Phân bổ doanh thu tự động giữa Quán ăn (85%), Shipper (100% phí ship) & Sàn Tran Gia (15%)</Text>
        </div>
        <Button
          type="primary"
          icon={<BankOutlined />}
          size="large"
          onClick={handleProcessPayout}
          style={{ backgroundColor: '#52C41A', fontWeight: 600 }}
        >
          Duyệt Quyết Toán Ví
        </Button>
      </div>

      {/* Top Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><PercentageOutlined style={{ color: adminDesignTokens.colors.primary, marginRight: 8 }} />Tổng Phí Hoa Hồng Thu Được</Text>}
                value={totalPlatformCommission}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: adminDesignTokens.colors.primary, fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><ShoppingOutlined style={{ color: '#52C41A', marginRight: 8 }} />Doanh Thu Chuyển Ví Quán</Text>}
                value={totalRestaurantRevenue}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: '#52C41A', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Text type="secondary"><DollarOutlined style={{ color: '#1890FF', marginRight: 8 }} />Phí Giao Hàng Thu Hộ Shipper</Text>}
                value={totalShipperDelivery}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: '#1890FF', fontWeight: 700, fontSize: 24 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Filter & Search Toolbar */}
      <Card className="table-filter-card" variant="borderless" style={{ marginBottom: 16, borderRadius: 12 }}>
        <div className="table-filter-toolbar">
          <Input
            placeholder="Tìm theo mã đơn hoặc tên quán..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search-input"
          />
          <div className="filter-select-group">
            <Text type="secondary" style={{ whiteSpace: 'nowrap' }}><FilterOutlined /> Lọc trạng thái:</Text>
            <Select defaultValue="ALL" value={statusFilter} onChange={(val) => setStatusFilter(val)} style={{ minWidth: 160 }}>
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="PROCESSED">Đã Giải Ngân</Option>
              <Option value="PENDING">Chờ Quyết Toán</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Commission Table */}
      <Card title="📋 Bảng Chi Tiết Phân Bổ Hoa Hồng Đơn Hàng" variant="borderless" style={{ borderRadius: 12 }}>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filteredCommissions}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} mục`,
          }}
          scroll={{ x: 1200 }}
          style={{ minHeight: 260 }}
          locale={{ emptyText: loading ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu hạch toán hoa hồng" /> }}
        />
      </Card>
    </div>
  );
}
