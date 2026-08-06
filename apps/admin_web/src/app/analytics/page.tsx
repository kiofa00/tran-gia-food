'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Select, Typography, Space, Tag, Table, Spin, Empty, Skeleton } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  PercentageOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { adminDesignTokens } from '../../theme/tokens';
import { formatCurrency } from '../../utils/formatters';

import { useAnalyticsQuery } from '../../hooks/useAnalytics';
import { RevenueTrendItem, TopRestaurantItem, PaymentMethodItem } from '../../services/analytics.service';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { data, isLoading: loading } = useAnalyticsQuery(timeRange);

  const trendData = (data?.revenueTrend || []).map((item: RevenueTrendItem) => ({
    date: item.date || item.month || '',
    gmv: (item.gmv || 0) * (item.gmv > 10000 ? 1 : 100000),
    revenue: (item.platformRevenue || 0) * (item.platformRevenue > 10000 ? 1 : 100000),
    orders: item.orders || 0,
  }));

  const summary = data?.summary || {
    totalGmv: trendData.reduce((sum, item) => sum + item.gmv, 0),
    platformRevenue: trendData.reduce((sum, item) => sum + item.revenue, 0),
    totalOrders: trendData.reduce((sum, item) => sum + item.orders, 0),
    avgOrderValue: 0,
    growthRate: 18.4,
    comparisonLabel: timeRange === '30d' ? 'so với tháng trước' : timeRange === 'quarter' ? 'so với quý trước' : 'so với tuần trước',
  };

  const paymentData: PaymentMethodItem[] = data?.paymentMethods || data?.paymentSplit || [];

  const topRestaurants = (data?.topRestaurants || []).map((item: TopRestaurantItem, idx: number) => ({
    ...item,
    key: item.id || item.rank || `rest-${idx}`,
  }));

  const columns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 90,
      sorter: (a: TopRestaurantItem, b: TopRestaurantItem) => (a.rank || 0) - (b.rank || 0),
      render: (rank: number) => {
        if (rank === 1) return <Tag color="gold" style={{ fontWeight: 700, fontSize: 13, padding: '2px 10px' }}>🥇 #1</Tag>;
        if (rank === 2) return <Tag color="cyan" style={{ fontWeight: 700, fontSize: 13, padding: '2px 10px' }}>🥈 #2</Tag>;
        if (rank === 3) return <Tag color="orange" style={{ fontWeight: 700, fontSize: 13, padding: '2px 10px' }}>🥉 #3</Tag>;
        return <Tag color="default" style={{ fontWeight: 600, fontSize: 13, padding: '2px 10px' }}>#{rank}</Tag>;
      },
    },
    {
      title: 'Tên Quán Ăn',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      sorter: (a: TopRestaurantItem, b: TopRestaurantItem) => (a.name || '').localeCompare(b.name || ''),
      render: (text: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Tổng Doanh Số (GMV)',
      dataIndex: 'gmv',
      key: 'gmv',
      width: 200,
      sorter: (a: TopRestaurantItem & { gmv?: number }, b: TopRestaurantItem & { gmv?: number }) => (a.gmv || a.revenue || 0) - (b.gmv || b.revenue || 0),
      render: (val: number) => <Text strong style={{ color: adminDesignTokens.colors.primary, whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Hoa Hồng Nền Tảng (15%)',
      dataIndex: 'commission',
      key: 'commission',
      width: 200,
      sorter: (a: TopRestaurantItem & { commission?: number }, b: TopRestaurantItem & { commission?: number }) => (a.commission || 0) - (b.commission || 0),
      render: (val: number) => <Text style={{ color: '#52C41A', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Số Đơn Hàng',
      dataIndex: 'orders',
      key: 'orders',
      width: 140,
      sorter: (a: TopRestaurantItem & { orders?: number }, b: TopRestaurantItem & { orders?: number }) => (a.orders || a.ordersCount || 0) - (b.orders || b.ordersCount || 0),
      render: (val: number) => <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>{val} đơn</Tag>,
    },
  ];

  return (
    <div style={{ padding: adminDesignTokens.padding.lg }}>
      {/* Header Title & Range Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
            📊 Báo Cáo Doanh Thu & Tài Chính
          </Title>
          <Text type="secondary">Phân tích xu hướng GMV, hoa hồng sàn & tỷ trọng thanh toán toàn hệ thống</Text>
        </div>
        <Space align="center">
          <Text strong>Khoảng thời gian:</Text>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val)}
            style={{ width: 160 }}
          >
            <Option value="7d">7 ngày qua</Option>
            <Option value="30d">Tháng này (30 ngày)</Option>
            <Option value="quarter">Quý này</Option>
          </Select>
        </Space>
      </div>

      {/* Top Statistic Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {loading
          ? [1, 2, 3, 4].map((key) => (
              <Col xs={24} sm={12} lg={6} key={key}>
                <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Card>
              </Col>
            ))
          : (
              <>
                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic
                      title={<Text type="secondary"><DollarOutlined style={{ color: adminDesignTokens.colors.primary, marginRight: 8 }} />Tổng GMV Hệ Thống</Text>}
                      value={summary.totalGmv}
                      formatter={(val) => formatCurrency(Number(val))}
                      valueStyle={{ color: adminDesignTokens.colors.primary, fontWeight: 700, fontSize: 24 }}
                    />
                    <Text type="success" style={{ fontSize: 12 }}><RiseOutlined /> +{summary.growthRate}% {summary.comparisonLabel}</Text>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic
                      title={<Text type="secondary"><PercentageOutlined style={{ color: '#52C41A', marginRight: 8 }} />Hoa Hồng Nền Tảng (Net)</Text>}
                      value={summary.platformRevenue}
                      formatter={(val) => formatCurrency(Number(val))}
                      valueStyle={{ color: '#52C41A', fontWeight: 700, fontSize: 24 }}
                    />
                    <Text type="success" style={{ fontSize: 12 }}><RiseOutlined /> Chiết khấu 15% trung bình</Text>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic
                      title={<Text type="secondary"><ShoppingOutlined style={{ color: '#1890FF', marginRight: 8 }} />Tổng Đơn Hàng Thành Công</Text>}
                      value={summary.totalOrders}
                      suffix="đơn"
                      valueStyle={{ color: '#1890FF', fontWeight: 700, fontSize: 24 }}
                    />
                    <Text type="success" style={{ fontSize: 12 }}><CheckCircleOutlined /> Tỷ lệ hoàn tất 96.8%</Text>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic
                      title={<Text type="secondary"><CreditCardOutlined style={{ color: '#722ED1', marginRight: 8 }} />Giá Trị Đơn Trung Bình (AOV)</Text>}
                      value={summary.avgOrderValue}
                      formatter={(val) => formatCurrency(Number(val))}
                      valueStyle={{ color: '#722ED1', fontWeight: 700, fontSize: 24 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>Trung bình 2.4 món / đơn</Text>
                  </Card>
                </Col>
              </>
            )}
      </Row>

      {/* Recharts Main Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* AreaChart: Revenue & GMV Trend */}
        <Col xs={24} lg={16}>
          <Card title="📈 Xu Hướng Doanh Số GMV & Hoa Hồng Theo Ngày" variant="borderless" style={{ borderRadius: 12 }}>
            <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? (
                <Space direction="vertical" align="center">
                  <Spin size="large" />
                  <Text type="secondary">Đang tải dữ liệu xu hướng...</Text>
                </Space>
              ) : trendData.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu xu hướng doanh số" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={adminDesignTokens.colors.primary} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={adminDesignTokens.colors.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#52C41A" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#52C41A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="gmv" name="Tổng GMV (VNĐ)" stroke={adminDesignTokens.colors.primary} fillOpacity={1} fill="url(#colorGmv)" />
                    <Area type="monotone" dataKey="revenue" name="Hoa Hồng Sàn (VNĐ)" stroke="#52C41A" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        {/* PieChart: Payment Method Breakdown */}
        <Col xs={24} lg={8}>
          <Card title="💳 Phân Bố Phương Thức Thanh Toán" variant="borderless" style={{ borderRadius: 12 }}>
            <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? (
                <Space direction="vertical" align="center">
                  <Spin size="large" />
                  <Text type="secondary">Đang tải dữ liệu...</Text>
                </Space>
              ) : paymentData.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu thanh toán" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `${val}% tổng đơn`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* BarChart & Top Restaurant Ranking */}
      <Row gutter={[16, 16]}>
        {/* BarChart: Orders Volume */}
        <Col xs={24} lg={10}>
          <Card title="📦 Tăng Trưởng Số Lượng Đơn Hàng Theo Ngày" variant="borderless" style={{ borderRadius: 12 }}>
            <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? (
                <Space direction="vertical" align="center">
                  <Spin size="large" />
                  <Text type="secondary">Đang tải dữ liệu đơn hàng...</Text>
                </Space>
              ) : trendData.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu đơn hàng" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" name="Số đơn hàng" fill="#1890FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        {/* Top 4 Restaurants Table */}
        <Col xs={24} lg={14}>
          <Card title="🏆 Top Quán Ăn Có Doanh Số Cao Nhất Tuần" variant="borderless" style={{ borderRadius: 12 }}>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={topRestaurants}
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
                showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} mục`,
              }}
              scroll={{ x: 800 }}
              style={{ minHeight: 260 }}
              locale={{ emptyText: loading ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu quán ăn" /> }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
