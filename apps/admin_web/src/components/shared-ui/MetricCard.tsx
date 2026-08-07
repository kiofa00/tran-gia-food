import React from 'react';

import { Card, Space, Typography } from 'antd';

import { adminDesignTokens } from '@/theme/tokens';
import { cn } from '@/utils/cn';

const { Title, Text } = Typography;

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subText?: string;
  iconColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  subText,
  iconColor = adminDesignTokens.colors.primary,
  className,
}) => {
  return (
    <Card variant="borderless" className={cn('rounded-xl shadow-xs h-full', className)}>
      <Space align="center" size="middle">
        {React.isValidElement(icon)
          ? React.cloneElement(
              icon as React.ReactElement<{
                className?: string;
                style?: React.CSSProperties;
              }>,
              {
                className: 'text-3xl',
                style: { color: iconColor },
              },
            )
          : icon}
        <div>
          <Text type="secondary">{label}</Text>
          <Title level={3} className="m-0">
            {value}
          </Title>
          {subText && (
            <Text type="secondary" className="text-xs">
              {subText}
            </Text>
          )}
        </div>
      </Space>
    </Card>
  );
};
