import React from 'react';
import { Tag } from 'antd';

interface AppTargetTagProps {
  target?: string;
}

export const AppTargetTag: React.FC<AppTargetTagProps> = ({ target }) => {
  switch ((target || 'ALL').toUpperCase()) {
    case 'CUSTOMER':
      return <Tag color="green">CUSTOMER APP</Tag>;
    case 'SHIPPER':
      return <Tag color="orange">SHIPPER APP</Tag>;
    case 'RESTAURANT':
      return <Tag color="purple">RESTAURANT APP</Tag>;
    case 'ADMIN_WEB':
      return <Tag color="red">ADMIN WEB</Tag>;
    default:
      return <Tag color="blue">TẤT CẢ APPS</Tag>;
  }
};
