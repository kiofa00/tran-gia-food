import React from 'react';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

interface PlateBadgeProps {
  plate?: string;
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({ plate }) => {
  if (!plate || plate.trim() === '') {
    return <Text type="secondary">—</Text>;
  }

  return (
    <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px', fontWeight: 'bold' }}>
      {plate}
    </Tag>
  );
};
