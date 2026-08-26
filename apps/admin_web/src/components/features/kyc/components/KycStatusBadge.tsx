'use client';

import React from 'react';

import { Tag } from 'antd';

import { useLocale } from '@/hooks/useLocale';

import type { KycStatus } from '../types';

interface KycStatusBadgeProps {
  status: KycStatus;
}

export function KycStatusBadge({ status }: KycStatusBadgeProps) {
  const { t } = useLocale();

  const configMap: Record<KycStatus, { color: string; label: string }> = {
    PENDING: { color: 'orange', label: `⏳ ${t('kyc.tabPending', 'Chờ duyệt')}` },
    APPROVED: { color: 'green', label: `✅ ${t('kyc.tabVerified', 'Đã duyệt')}` },
    REJECTED: { color: 'red', label: `❌ ${t('kyc.tabRejected', 'Từ chối')}` },
  };

  const config = configMap[status] ?? configMap.PENDING;

  return <Tag color={config.color}>{config.label}</Tag>;
}
