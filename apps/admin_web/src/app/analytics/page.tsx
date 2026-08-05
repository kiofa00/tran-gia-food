'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Select, Typography, Space, Tag, Table } from 'antd';
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

const { Title, Text } = Typography;
const { Option } = Select;

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  const [trendData, setTrendData] = useState([
    { date: 'T2 (29/07)', gmv: 12500000, revenue: 1875000, orders: 142 },
    { date: 'T3 (30/07)', gmv: 15200000, revenue: 2280000, orders: 168 },
    { date: 'T4 (31/07)', gmv: 14100000, revenue: 2115000, orders: 155 },
    { date: 'T5 (01/08)', gmv: 18900000, revenue: 2835000, orders: 204 },
    { date: 'T6 (02/08)', gmv: 22400000, revenue: 3360000, orders: 245 },
    { date: 'T7 (03/08)', gmv: 28500000, revenue: 4275000, orders: 310 },
    { date: 'CN (04/08)', gmv: 31200000, revenue: 4680000, orders: 338 },
  ]);

  const [paymentData, setPaymentData] = useState([
    { name: 'Ví MoMo', value: 52, color: '#A50064' },
    { name: 'Chuyển Khoản Ngân Hàng', value: 33, color: '#1890FF' },
    { name: 'Tiền Mặt (COD)', value: 15, color: '#52C41A' },
  ]);

  const [topRestaurants, setTopRestaurants] = useState([
    { key: '1', rank: 1, name: 'Cơm Tấm Sà Bì Chưởng - Quận 1', gmv: 42500000, commission: 6375000, orders: 512 },
    { key: '2', rank: 2, name: 'Phở Thìn Bờ Hồ - Hà Nội', gmv: 38200000, commission: 5730000, orders: 420 },
    { key: '3', rank: 3, name: 'Bánh Mì Huỳnh Hoa - Quận 1', gmv: 31900000, commission: 4785000, orders: 638 },
    { key: '4', rank: 4, name: 'Trà Sữa Phúc Long - Ngô Đức Kế', gmv: 27800000, commission: 4170000, orders: 580 },
  ]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        if (data.revenueTrend) {
          setTrendData(
            data.revenueTrend.map((item: any) => ({
              date: item.month || item.date,
              gmv: item.gmv * 100000,
              revenue: item.platformRevenue * 100000,
              orders: item.orders || 150,
            })),
          );
        }
      }
    } catch {
      // Retain fallback data on error
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 90,
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
      render: (text: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Tổng Doanh Số (GMV)',
      dataIndex: 'gmv',
      key: 'gmv',
      width: 200,
      render: (val: number) => <Text strong style={{ color: adminDesignTokens.colors.primary, whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Hoa Hồng Nền Tảng (15%)',
      dataIndex: 'commission',
      key: 'commission',
      width: 200,
      render: (val: number) => <Text style={{ color: '#52C41A', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Số Đơn Hàng',
      dataIndex: 'orders',
      key: 'orders',
      width: 140,
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
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 160 }}>
            <Option value="7d">7 ngày qua</Option>
            <Option value="30d">Tháng này (30 ngày)</Option>
            <Option value="quarter">Quý này</Option>
          </Select>
        </Space>
      </div>

      {/* Top Statistic Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<Text type="secondary"><DollarOutlined style={{ color: adminDesignTokens.colors.primary, marginRight: 8 }} />Tổng GMV Hệ Thống</Text>}
              value={142800000}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{ color: adminDesignTokens.colors.primary, fontWeight: 700, fontSize: 24 }}
            />
            <Text type="success" style={{ fontSize: 12 }}><RiseOutlined /> +18.4% so với tuần trước</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<Text type="secondary"><PercentageOutlined style={{ color: '#52C41A', marginRight: 8 }} />Hoa Hồng Nền Tảng (Net)</Text>}
              value={21420000}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{ color: '#52C41A', fontWeight: 700, fontSize: 24 }}
            />
            <Text type="success" style={{ fontSize: 12 }}><RiseOutlined /> Chiết khấu 15% trung bình</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<Text type="secondary"><ShoppingOutlined style={{ color: '#1890FF', marginRight: 8 }} />Tổng Đơn Hàng Thành Công</Text>}
              value={1566}
              suffix="đơn"
              valueStyle={{ color: '#1890FF', fontWeight: 700, fontSize: 24 }}
            />
            <Text type="success" style={{ fontSize: 12 }}><CheckCircleOutlined /> Tỷ lệ hoàn tất 96.8%</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<Text type="secondary"><CreditCardOutlined style={{ color: '#722ED1', marginRight: 8 }} />Giá Trị Đơn Trung Bình (AOV)</Text>}
              value={91187}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{ color: '#722ED1', fontWeight: 700, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Trung bình 2.4 món / đơn</Text>
          </Card>
        </Col>
      </Row>

      {/* Recharts Main Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* AreaChart: Revenue & GMV Trend */}
        <Col xs={24} lg={16}>
          <Card title="📈 Xu Hướng Doanh Số GMV & Hoa Hồng Theo Ngày" bordered={false} style={{ borderRadius: 12 }}>
            <div style={{ width: '100%', height: 320 }}>
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
            </div>
          </Card>
        </Col>

        {/* PieChart: Payment Method Breakdown */}
        <Col xs={24} lg={8}>
          <Card title="💳 Phân Bố Phương Thức Thanh Toán" bordered={false} style={{ borderRadius: 12 }}>
            <div style={{ width: '100%', height: 320 }}>
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
            </div>
          </Card>
        </Col>
      </Row>

      {/* BarChart & Top Restaurant Ranking */}
      <Row gutter={[16, 16]}>
        {/* BarChart: Orders Volume */}
        <Col xs={24} lg={10}>
          <Card title="📦 Tăng Trưởng Số Lượng Đơn Hàng Theo Ngày" bordered={false} style={{ borderRadius: 12 }}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" name="Số đơn hàng" fill="#1890FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Top 4 Restaurants Table */}
        <Col xs={24} lg={14}>
          <Card title="🏆 Top Quán Ăn Có Doanh Số Cao Nhất Tuần" bordered={false} style={{ borderRadius: 12 }}>
            <Table columns={columns} dataSource={topRestaurants} pagination={false} scroll={{ x: 800 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
