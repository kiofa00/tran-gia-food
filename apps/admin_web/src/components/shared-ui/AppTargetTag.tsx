import React from 'react';

import { Tag } from 'antd';

import { useLocale } from '@/hooks/useLocale';

interface AppTargetTagProps {
  target?: string;
}

export const AppTargetTag: React.FC<AppTargetTagProps> = ({ target }) => {
  const { t } = useLocale();

  switch ((target || 'ALL').toUpperCase()) {
    case 'CUSTOMER':
      return (
        <Tag color="green" className="font-medium rounded-sm">
          {t('cms.customerApp', 'Customer App')}
        </Tag>
      );
    case 'SHIPPER':
      return (
        <Tag color="orange" className="font-medium rounded-sm">
          {t('cms.shipperApp', 'Shipper App')}
        </Tag>
      );
    case 'RESTAURANT':
      return (
        <Tag color="purple" className="font-medium rounded-sm">
          {t('cms.restaurantApp', 'Restaurant App')}
        </Tag>
      );
    case 'ADMIN_WEB':
      return (
        <Tag color="red" className="font-medium rounded-sm">
          {t('cms.adminWebApp', 'Admin Web')}
        </Tag>
      );
    default:
      return (
        <Tag color="blue" className="font-medium rounded-sm">
          {t('cms.allApps', 'Tất Cả Ứng Dụng (ALL)')}
        </Tag>
      );
  }
};
