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
    <Tag color="blue" className="text-xs px-2.5 py-0.5 font-bold rounded-md">
      {plate}
    </Tag>
  );
};
