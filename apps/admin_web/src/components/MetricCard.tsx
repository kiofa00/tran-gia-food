import React from 'react';
import { Card, Space, Typography } from 'antd';
import { adminDesignTokens } from '../theme/tokens';

const { Title, Text } = Typography;

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subText?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  subText,
  iconColor = adminDesignTokens.colors.primary,
}) => {
  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: adminDesignTokens.borderRadius.lg,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: '100%',
      }}
    >
      <Space align="center" size="middle">
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, {
              style: { fontSize: 32, color: iconColor },
            })
          : icon}
        <div>
          <Text type="secondary">{label}</Text>
          <Title level={3} style={{ margin: 0 }}>
            {value}
          </Title>
          {subText && <Text type="secondary" style={{ fontSize: 12 }}>{subText}</Text>}
        </div>
      </Space>
    </Card>
  );
};
