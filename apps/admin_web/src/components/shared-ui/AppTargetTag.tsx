import React from 'react';

import { Tag } from 'antd';

interface AppTargetTagProps {
  target?: string;
}

export const AppTargetTag: React.FC<AppTargetTagProps> = ({ target }) => {
  switch ((target || 'ALL').toUpperCase()) {
    case 'CUSTOMER':
      return (
        <Tag color="green" className="font-medium rounded-sm">
          CUSTOMER APP
        </Tag>
      );
    case 'SHIPPER':
      return (
        <Tag color="orange" className="font-medium rounded-sm">
          SHIPPER APP
        </Tag>
      );
    case 'RESTAURANT':
      return (
        <Tag color="purple" className="font-medium rounded-sm">
          RESTAURANT APP
        </Tag>
      );
    case 'ADMIN_WEB':
      return (
        <Tag color="red" className="font-medium rounded-sm">
          ADMIN WEB
        </Tag>
      );
    default:
      return (
        <Tag color="blue" className="font-medium rounded-sm">
          TẤT CẢ APPS
        </Tag>
      );
  }
};
