'use client';

import React from 'react';

import { Badge, Button, Descriptions, Modal, Space, Tag } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import { RESTAURANT_STATUS_COLOR_MAP } from '@/shared-config';
import { formatDateTime } from '@/utils/formatters';

import { RestaurantRecord } from '../RestaurantColumns';

interface RestaurantDetailModalProps {
  open: boolean;
  restaurant: RestaurantRecord | null;
  onClose: () => void;
  onApprove?: (r: RestaurantRecord) => void;
  onSuspend?: (r: RestaurantRecord) => void;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  open,
  restaurant,
  onClose,
  onApprove,
  onSuspend,
}) => {
  const { t } = useLocale();

  if (!restaurant) return null;

  const RESTAURANT_STATUS_LABELS: Record<string, string> = {
    PENDING: t('restaurants.pending', 'Chờ duyệt'),
    APPROVED: t('restaurants.active', 'Đang hoạt động'),
    SUSPENDED: t('restaurants.suspend', 'Bị đình chỉ'),
  };

  const statusLabel =
    RESTAURANT_STATUS_LABELS[restaurant.status] ?? t('restaurants.suspend', 'Bị đình chỉ');
  const statusColor =
    (RESTAURANT_STATUS_COLOR_MAP as Record<string, string>)[restaurant.status] ?? 'default';

  return (
    <Modal
      title={t('restaurants.detailTitle', 'Chi Tiết Nhà Hàng & Đối Tác Quán')}
      open={open}
      onCancel={onClose}
      width={600}
      footer={
        <div className="flex justify-between items-center w-full">
          <div>
            {restaurant.status === 'PENDING' && onApprove && (
              <Button
                type="primary"
                className="bg-green-600 border-none font-semibold"
                onClick={() => {
                  onClose();
                  onApprove(restaurant);
                }}
              >
                {t('restaurants.approve', 'Phê Duyệt Mở Quán')}
              </Button>
            )}
            {restaurant.status === 'APPROVED' && onSuspend && (
              <Button
                danger
                onClick={() => {
                  onClose();
                  onSuspend(restaurant);
                }}
              >
                {t('restaurants.suspend', 'Tạm Đình Chỉ')}
              </Button>
            )}
            {restaurant.status === 'SUSPENDED' && onApprove && (
              <Button
                type="primary"
                className="bg-green-600 border-none font-semibold"
                onClick={() => {
                  onClose();
                  onApprove(restaurant);
                }}
              >
                {t('restaurants.reopen', 'Mở Lại Quán')}
              </Button>
            )}
          </div>
          <Button type="default" onClick={onClose}>
            {t('common.close', 'Đóng')}
          </Button>
        </div>
      }
    >
      <Descriptions column={1} bordered className="mt-4">
        <Descriptions.Item label={t('restaurants.name', 'Tên Nhà Hàng')}>
          <span className="font-semibold text-slate-800 text-base">{restaurant.name}</span>
        </Descriptions.Item>

        <Descriptions.Item label={t('restaurants.restaurantId', 'Mã Nhà Hàng')}>
          <span className="font-mono text-xs text-slate-500">{restaurant.id}</span>
        </Descriptions.Item>

        <Descriptions.Item label={t('restaurants.owner', 'Chủ Sở Hữu')}>
          <span className="font-medium">{restaurant.ownerName || '—'}</span>
        </Descriptions.Item>

        <Descriptions.Item label={t('restaurants.phone', 'Số Điện Thoại')}>
          <span className="font-medium text-blue-600">{restaurant.phone || '—'}</span>
        </Descriptions.Item>

        <Descriptions.Item label={t('restaurants.address', 'Địa Chỉ')}>
          <span>{restaurant.address || '—'}</span>
        </Descriptions.Item>

        <Descriptions.Item label={t('restaurants.status', 'Trạng Thái')}>
          <Tag color={statusColor} className="font-medium">
            {statusLabel}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label={t('restaurants.rating', 'Đánh Giá')}>
          <Space>
            <span>⭐ {restaurant.avgRating.toFixed(1)} / 5.0</span>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label={t('analytics.ordersCount', 'Tổng Đơn Hàng')}>
          <Badge
            count={restaurant.totalOrders}
            overflowCount={999999}
            style={{ backgroundColor: '#108ee9' }}
          />
          <span className="ml-2 text-slate-500">{t('common.items', 'đơn')}</span>
        </Descriptions.Item>

        <Descriptions.Item label={t('users.createdAt', 'Ngày Tham Gia')}>
          {formatDateTime(restaurant.createdAt)}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
