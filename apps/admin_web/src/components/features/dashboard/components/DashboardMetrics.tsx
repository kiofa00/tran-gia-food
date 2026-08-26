'use client';

import React from 'react';

import {
  CarOutlined,
  DollarOutlined,
  FileTextOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import { adminDesignTokens } from '@/theme/tokens';

import type { DashboardStats } from '../types';

interface DashboardMetricsProps {
  stats: DashboardStats;
  loading: boolean;
}

const { Text } = Typography;

export function DashboardMetrics({ stats, loading }: DashboardMetricsProps) {
  const { t } = useLocale();

  return (
    <div className="mb-6 space-y-4">
      {/* Primary Financial KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            className="rounded-xl shadow-xs hover:shadow-sm transition-shadow"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={
                  <Text type="secondary" className="text-xs uppercase tracking-wide font-medium">
                    <DollarOutlined className="text-orange-500 mr-1.5" />
                    {t('dashboard.platformRevenue', 'Doanh Thu Hoa Hồng (Sàn)')}
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
          <Card
            variant="borderless"
            className="rounded-xl shadow-xs hover:shadow-sm transition-shadow"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={
                  <Text type="secondary" className="text-xs uppercase tracking-wide font-medium">
                    <ShoppingOutlined className="text-emerald-600 mr-1.5" />
                    {t('dashboard.foodGmv', 'Tổng GMV Đặt Đồ Ăn')}
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
          <Card
            variant="borderless"
            className="rounded-xl shadow-xs hover:shadow-sm transition-shadow"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={
                  <Text type="secondary" className="text-xs uppercase tracking-wide font-medium">
                    <CarOutlined className="text-blue-500 mr-1.5" />
                    {t('dashboard.shipGmv', 'Tổng Cước Phí Shipping')}
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
          <Card
            variant="borderless"
            className="rounded-xl shadow-xs hover:shadow-sm transition-shadow"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={
                  <Text type="secondary" className="text-xs uppercase tracking-wide font-medium">
                    <FileTextOutlined className="text-amber-500 mr-1.5" />
                    {t('dashboard.totalOrders', 'Tổng Đơn Hàng')}
                  </Text>
                }
                value={stats.totalOrders}
                suffix={t('dashboard.orderUnit', 'đơn')}
                valueStyle={{
                  color: adminDesignTokens.colors.statusPending,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Operational Scale KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className="rounded-xl shadow-xs bg-slate-50/50">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={
                  <Text type="secondary" className="text-xs">
                    <TeamOutlined className="text-indigo-500 mr-1.5" />
                    {t('dashboard.totalUsers', 'Tổng Người Dùng')}
                  </Text>
                }
                value={stats.totalUsers ?? 0}
                suffix={t('dashboard.userUnit', 'người dùng')}
                valueStyle={{
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card variant="borderless" className="rounded-xl shadow-xs bg-slate-50/50">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={
                  <Text type="secondary" className="text-xs">
                    <ShopOutlined className="text-rose-500 mr-1.5" />
                    {t('dashboard.totalRestaurants', 'Nhà Hàng Đối Tác')}
                  </Text>
                }
                value={stats.totalRestaurants ?? 0}
                suffix={t('dashboard.restaurantUnit', 'quán')}
                valueStyle={{
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card variant="borderless" className="rounded-xl shadow-xs bg-slate-50/50">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={
                  <Text type="secondary" className="text-xs">
                    <UserOutlined className="text-purple-600 mr-1.5" />
                    {t('dashboard.onlineShippers', 'Đội Ngũ Tài Xế Online')}
                  </Text>
                }
                value={stats.totalShippers}
                suffix={t('users.driverUnit', 'Tài xế')}
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
    </div>
  );
}
