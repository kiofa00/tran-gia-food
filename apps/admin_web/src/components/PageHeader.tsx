import React from 'react';
import { Row, Col, Typography, Space } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  icon?: string | React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="mb-6">
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18}>
          <Space align="center" size="small">
            {typeof icon === 'string' ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              icon
            )}
            <Title level={2} className="m-0 text-orange-500">
              {title}
            </Title>
          </Space>
          {subtitle && (
            <div className="mt-1">
              <Text type="secondary">{subtitle}</Text>
            </div>
          )}
        </Col>
        {action && (
          <Col xs={24} sm={8} md={6} className="text-right">
            {action}
          </Col>
        )}
      </Row>
    </div>
  );
};
