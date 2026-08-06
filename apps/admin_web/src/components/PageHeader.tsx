import React from 'react';
import { Row, Col, Typography, Space } from 'antd';
import { adminDesignTokens } from '../theme/tokens';

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
    <div style={{ marginBottom: 24 }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18}>
          <Space align="center" size="small">
            {typeof icon === 'string' ? (
              <span style={{ fontSize: 24 }}>{icon}</span>
            ) : (
              icon
            )}
            <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
              {title}
            </Title>
          </Space>
          {subtitle && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">{subtitle}</Text>
            </div>
          )}
        </Col>
        {action && (
          <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
            {action}
          </Col>
        )}
      </Row>
    </div>
  );
};
