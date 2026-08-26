'use client';

import React from 'react';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';

import { useLocale } from '@/hooks/useLocale';

interface KycStatsRowProps {
  pending: number;
  approved: number;
  rejected: number;
}

export function KycStatsRow({ pending, approved, rejected }: KycStatsRowProps) {
  const { t } = useLocale();

  return (
    <Row gutter={16} className="mb-6">
      <Col span={8}>
        <Card variant="borderless" className="rounded-xl shadow-xs">
          <Statistic
            title={`⏳ ${t('kyc.tabPending', 'Chờ duyệt')}`}
            value={pending}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<SafetyCertificateOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card variant="borderless" className="rounded-xl shadow-xs">
          <Statistic
            title={`✅ ${t('kyc.tabVerified', 'Đã duyệt')}`}
            value={approved}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card variant="borderless" className="rounded-xl shadow-xs">
          <Statistic
            title={`❌ ${t('kyc.tabRejected', 'Từ chối')}`}
            value={rejected}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
}
