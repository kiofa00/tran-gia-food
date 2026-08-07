'use client';

import React from 'react';

import { CarOutlined, ShopOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';

import { MetricCard } from '@/components/shared-ui/MetricCard';
import { useTranslation } from '@/providers/LanguageProvider';
import { adminDesignTokens } from '@/theme/tokens';

interface UserMetricsProps {
  totalUsersCount: number;
  customersCount: number;
  restaurantsCount: number;
  shippersCount: number;
}

export const UserMetrics: React.FC<UserMetricsProps> = ({
  totalUsersCount,
  customersCount,
  restaurantsCount,
  shippersCount,
}) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          icon={<TeamOutlined />}
          label={t('users.totalUsers', 'Tổng Số Người Dùng')}
          value={`${totalUsersCount} ${t('users.accountsUnit', 'Tài khoản')}`}
          iconColor={adminDesignTokens.colors.primary}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          icon={<UserOutlined />}
          label={t('users.customers', 'Khách Hàng')}
          value={`${customersCount} ${t('users.userUnit', 'User')}`}
          iconColor={adminDesignTokens.colors.statusInfo}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          icon={<ShopOutlined />}
          label={t('users.restaurants', 'Đối Tác Quán Ăn')}
          value={`${restaurantsCount} ${t('users.restaurantUnit', 'Nhà hàng')}`}
          iconColor={adminDesignTokens.colors.statOrange}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          icon={<CarOutlined />}
          label={t('users.shippers', 'Đội Ngũ Shipper')}
          value={`${shippersCount} ${t('users.driverUnit', 'Tài xế')}`}
          iconColor={adminDesignTokens.colors.statusApproved}
        />
      </Col>
    </Row>
  );
};
