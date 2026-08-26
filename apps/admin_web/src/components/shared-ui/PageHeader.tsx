import React from 'react';

import { Space, Typography } from 'antd';

import { cn } from '@/utils/cn';

const { Title, Text } = Typography;

interface PageHeaderProps {
  icon?: string | React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4',
        className,
      )}
    >
      <div className="min-w-0">
        <Space align="center" size="small">
          {typeof icon === 'string' ? <span className="text-2xl">{icon}</span> : icon}
          <Title level={2} className="!m-0 text-orange-500 text-xl sm:text-2xl">
            {title}
          </Title>
        </Space>
        {subtitle && (
          <div className="mt-1">
            <Text type="secondary" className="text-xs sm:text-sm text-slate-500">
              {subtitle}
            </Text>
          </div>
        )}
      </div>

      {action && (
        <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">{action}</div>
      )}
    </div>
  );
};
