'use client';

import { CarOutlined, DollarOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';

import { adminDesignTokens } from '@/theme/tokens';

import type { DashboardStats } from '../types';

interface DashboardMetricsProps {
  stats: DashboardStats;
  loading: boolean;
}

const { Text } = Typography;

export function DashboardMetrics({ stats, loading }: DashboardMetricsProps) {
  return (
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
  );
}
