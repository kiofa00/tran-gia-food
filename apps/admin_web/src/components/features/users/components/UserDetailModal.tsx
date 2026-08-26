'use client';

import React from 'react';

import { Badge, Button, Descriptions, Modal, Tag } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import { formatDateTime } from '@/utils/formatters';

import { UserRecord } from '../types';
import { getRoleTagProps } from './UserColumns';

interface UserDetailModalProps {
  open: boolean;
  user: UserRecord | null;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, user, onClose }) => {
  const { t } = useLocale();

  return (
    <Modal
      title={t('users.detailTitle', 'Chi Tiết Tài Khoản Người Dùng')}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          {t('common.close', 'Đóng')}
        </Button>,
      ]}
    >
      {user && (
        <Descriptions column={1} bordered className="mt-4">
          <Descriptions.Item label={t('users.userId', 'Mã User')}>{user.id}</Descriptions.Item>
          <Descriptions.Item label={t('users.fullName', 'Họ và Tên')}>
            {user.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.phone', 'Số Điện Thoại')}>
            {user.phone}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.email', 'Email')}>
            {user.email || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.role', 'Vai Trò')}>
            {(() => {
              const { color, label } = getRoleTagProps(user.role);

              return <Tag color={color}>{label}</Tag>;
            })()}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.status', 'Trạng Thái')}>
            <Badge
              status={user.status === 'ACTIVE' ? 'success' : 'error'}
              text={
                user.status === 'ACTIVE'
                  ? t('users.active', 'Hoạt Động')
                  : t('users.suspended', 'Tạm Khóa')
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label={t('users.registeredAt', 'Ngày Đăng Ký')}>
            {formatDateTime(user.createdAt)}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};
