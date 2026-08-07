import React from 'react';

import { EyeOutlined, LockOutlined, UnlockOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Space, Tag, Typography } from 'antd';

import { TranslationKey } from '@/providers/LanguageProvider';
import { adminDesignTokens } from '@/theme/tokens';

import { UserRecord } from '../types';

const { Text } = Typography;

interface GetUserColumnsParams {
  t: (key: TranslationKey, defaultText?: string) => string;
  onViewDetail: (record: UserRecord) => void;
  onToggleStatus: (record: UserRecord) => void;
}

const getAvatarBgColor = (role: string) => {
  if (role === 'ADMIN') return adminDesignTokens.colors.statPurple;
  if (role === 'SHIPPER') return adminDesignTokens.colors.statusApproved;
  if (role === 'RESTAURANT_OWNER') return adminDesignTokens.colors.statOrange;

  return adminDesignTokens.colors.statBlue;
};

export const getUserColumns = ({ t, onViewDetail, onToggleStatus }: GetUserColumnsParams) => [
  {
    title: t('users.user', 'Người Dùng'),
    dataIndex: 'name',
    key: 'name',
    render: (name: string, record: UserRecord) => (
      <Space>
        <Avatar
          style={{ backgroundColor: getAvatarBgColor(record.role) }}
          icon={<UserOutlined />}
        />
        <div>
          <Text strong className="block">
            {name}
          </Text>
          <Text type="secondary" className="text-xs">
            ID: {record.id}
          </Text>
        </div>
      </Space>
    ),
  },
  {
    title: t('users.contact', 'Liên Hệ'),
    dataIndex: 'phone',
    key: 'phone',
    render: (phone: string, record: UserRecord) => (
      <div>
        <Text className="block font-medium">{phone}</Text>
        {record.email && (
          <Text type="secondary" className="text-xs">
            {record.email}
          </Text>
        )}
      </div>
    ),
  },
  {
    title: t('users.role', 'Vai Trò'),
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => {
      let color = 'blue';
      let label = t('users.customers', 'Khách Hàng');

      if (role === 'RESTAURANT_OWNER') {
        color = 'orange';
        label = t('users.restaurants', 'Đối Tác Quán');
      } else if (role === 'SHIPPER') {
        color = 'green';
        label = t('users.shippers', 'Shipper');
      } else if (role === 'ADMIN') {
        color = 'purple';
        label = t('users.admin', 'Quản Trị Viên');
      }

      return <Tag color={color}>{label}</Tag>;
    },
  },
  {
    title: t('users.status', 'Trạng Thái'),
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Badge
        status={status === 'ACTIVE' ? 'success' : 'error'}
        text={
          status === 'ACTIVE' ? t('users.active', 'Hoạt Động') : t('users.suspended', 'Tạm Khóa')
        }
      />
    ),
  },
  {
    title: t('users.createdAt', 'Ngày Tạo'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (val: string) => (val ? new Date(val).toLocaleDateString('vi-VN') : '—'),
  },
  {
    title: t('users.actions', 'Thao Tác'),
    key: 'actions',
    render: (_: unknown, record: UserRecord) => (
      <Space>
        <Button type="text" icon={<EyeOutlined />} onClick={() => onViewDetail(record)}>
          {t('users.details', 'Chi Tiết')}
        </Button>
        <Button
          type="text"
          danger={record.status === 'ACTIVE'}
          icon={record.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
          onClick={() => onToggleStatus(record)}
        >
          {record.status === 'ACTIVE' ? t('users.lock', 'Khóa') : t('users.unlock', 'Mở khóa')}
        </Button>
      </Space>
    ),
  },
];
