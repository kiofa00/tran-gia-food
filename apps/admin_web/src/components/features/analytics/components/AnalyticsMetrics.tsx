'use client';

import React from 'react';

import {
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  PercentageOutlined,
  RiseOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';
import { adminDesignTokens } from '@/theme/tokens';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

interface AnalyticsSummaryData {
  totalGmv: number;
  platformRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate: number;
  comparisonLabel: string;
}

interface AnalyticsMetricsProps {
  summary: AnalyticsSummaryData;
  effectiveCommissionRate: string;
  completionRate: string;
  itemsPerOrder: string;
  loading: boolean;
}

export const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({
  summary,
  effectiveCommissionRate,
  completionRate,
  itemsPerOrder,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {loading ? (
        [1, 2, 3, 4].map((key) => (
          <Col xs={24} sm={12} lg={6} key={key}>
            <Card variant="borderless" className="rounded-xl shadow-xs">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))
      ) : (
        <>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="rounded-xl shadow-xs">
              <Statistic
                title={
                  <Text type="secondary">
                    <DollarOutlined className="text-orange-500 mr-2" />
                    {t('analytics.totalRevenue', 'Tổng Doanh Thu Hàng Tháng')}
                  </Text>
                }
                value={summary.totalGmv}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{
                  color: adminDesignTokens.colors.statOrange,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
              />
              <Text type="success" className="text-xs">
                <RiseOutlined /> +{summary.growthRate}% {summary.comparisonLabel}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="rounded-xl shadow-xs">
              <Statistic
                title={
                  <Text type="secondary">
                    <PercentageOutlined className="text-green-600 mr-2" />
                    {t('commissions.totalRevenue', 'Hoa Hồng Nền Tảng (Net)')}
                  </Text>
                }
                value={summary.platformRevenue}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{
                  color: adminDesignTokens.colors.statGreen,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
              />
              <Text type="success" className="text-xs">
                <RiseOutlined /> Chiết khấu {effectiveCommissionRate}% thực tế
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="rounded-xl shadow-xs">
              <Statistic
                title={
                  <Text type="secondary">
                    <ShoppingOutlined className="text-blue-500 mr-2" />
                    {t('analytics.totalOrders', 'Tổng Số Đơn Hàng')}
                  </Text>
                }
                value={summary.totalOrders}
                suffix={t('common.items', 'mục')}
                valueStyle={{
                  color: adminDesignTokens.colors.statBlue,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
              />
              <Text type="success" className="text-xs">
                <CheckCircleOutlined /> Tỷ lệ hoàn tất {completionRate}%
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="rounded-xl shadow-xs">
              <Statistic
                title={
                  <Text type="secondary">
                    <CreditCardOutlined className="text-purple-600 mr-2" />
                    {t('analytics.avgOrderValue', 'Giá Trị Đơn Trung Bình')}
                  </Text>
                }
                value={summary.avgOrderValue}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{
                  color: adminDesignTokens.colors.statPurple,
                  fontWeight: adminDesignTokens.fontWeightBold,
                  fontSize: adminDesignTokens.fontSizeXl,
                }}
              />
              <Text type="secondary" className="text-xs">
                Trung bình {itemsPerOrder} món / đơn
              </Text>
            </Card>
          </Col>
        </>
      )}
    </Row>
  );
};
