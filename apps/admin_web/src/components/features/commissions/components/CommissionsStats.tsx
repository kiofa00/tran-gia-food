'use client';

import { DollarOutlined, PercentageOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';
import { adminDesignTokens } from '@/theme/tokens';
import { formatCurrency } from '@/utils/formatters';

interface CommissionsStatsProps {
  loading: boolean;
  totalPlatformCommission: number;
  totalRestaurantRevenue: number;
  totalShipperDelivery: number;
}

const { Text } = Typography;

export function CommissionsStats({
  loading,
  totalPlatformCommission,
  totalRestaurantRevenue,
  totalShipperDelivery,
}: CommissionsStatsProps) {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={8}>
        <Card variant="borderless" className="rounded-xl shadow-xs">
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic
              title={
                <Text type="secondary">
                  <PercentageOutlined className="text-orange-500 mr-2" />
                  {t('commissions.totalRevenue', 'Tổng Phí Hoa Hồng Thu Được')}
                </Text>
              }
              value={totalPlatformCommission}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{
                color: adminDesignTokens.colors.statOrange,
                fontWeight: adminDesignTokens.fontWeightBold,
                fontSize: adminDesignTokens.fontSizeXl,
              }}
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
              title={
                <Text type="secondary">
                  <ShoppingOutlined className="text-green-600 mr-2" />
                  {t('commissions.merchantPayouts', 'Doanh Thu Chuyển Ví Quán')}
                </Text>
              }
              value={totalRestaurantRevenue}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{
                color: adminDesignTokens.colors.statGreen,
                fontWeight: adminDesignTokens.fontWeightBold,
                fontSize: adminDesignTokens.fontSizeXl,
              }}
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
              title={
                <Text type="secondary">
                  <DollarOutlined className="text-blue-500 mr-2" />
                  {t('commissions.pendingPayouts', 'Phí Giao Hàng Thu Hộ Shipper')}
                </Text>
              }
              value={totalShipperDelivery}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{
                color: adminDesignTokens.colors.statBlue,
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
