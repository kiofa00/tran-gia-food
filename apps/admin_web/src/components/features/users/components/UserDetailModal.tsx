'use client';

import React from 'react';

import { Badge, Button, Descriptions, Modal, Tag } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';

import { UserRecord } from '../types';

interface UserDetailModalProps {
  open: boolean;
  user: UserRecord | null;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, user, onClose }) => {
  const { t } = useTranslation();

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
            <Tag color="blue">{user.role}</Tag>
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
            {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '—'}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};
