'use client';

import React from 'react';

import Link from 'next/link';

import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Row, Space, Typography } from 'antd';

import { useKycQuery } from '@/components/features/kyc';
import { useLocale } from '@/hooks/useLocale';
import { ADMIN_ROUTES } from '@/shared-config';

const { Text } = Typography;

export function DashboardActionAlerts() {
  const { t } = useLocale();
  const { data: kycData = [], isLoading } = useKycQuery();

  const pendingKycCount = React.useMemo(() => {
    return kycData.filter((item) => {
      const st = String(item.ekycStatus ?? item.kycStatus ?? item.status ?? '').toUpperCase();

      return st === 'PENDING' || st === 'NONE' || !st;
    }).length;
  }, [kycData]);

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={pendingKycCount > 0 ? 14 : 12}>
          {pendingKycCount > 0 ? (
            <Alert
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined className="text-amber-500 text-lg" />}
              className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs"
              message={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <Text strong className="text-amber-900 block font-medium">
                      {t(
                        'dashboard.pendingKycAlert',
                        'Đang có {count} hồ sơ eKYC shipper chờ xét duyệt',
                        {
                          count: pendingKycCount,
                        },
                      )}
                    </Text>
                    <Text type="secondary" className="text-xs text-amber-700">
                      {t(
                        'dashboard.quickLinks.kycDesc',
                        'Thẩm định ảnh CCCD 2 mặt, bằng lái, đăng ký xe và kích hoạt tài xế',
                      )}
                    </Text>
                  </div>
                  <Link href={ADMIN_ROUTES.KYC} passHref>
                    <Button
                      type="primary"
                      size="middle"
                      className="bg-amber-600 hover:bg-amber-500 border-none shrink-0 font-medium"
                      icon={<SafetyCertificateOutlined />}
                    >
                      {t('dashboard.pendingKycAction', 'Thẩm định hồ sơ ngay')}
                    </Button>
                  </Link>
                </div>
              }
            />
          ) : (
            <Card
              variant="borderless"
              className="rounded-xl shadow-xs bg-emerald-50/50 border border-emerald-100 p-2"
            >
              <Space align="center" className="w-full">
                <CheckCircleOutlined className="text-emerald-500 text-xl mr-2" />
                <div>
                  <Text strong className="text-emerald-900 block text-sm">
                    {t('dashboard.allKycProcessed', 'Tất cả hồ sơ eKYC shipper đã được xử lý')}
                  </Text>
                  <Text type="secondary" className="text-xs text-emerald-700">
                    {t(
                      'dashboard.systemStatusOnline',
                      'Hệ thống & API Realtime đang hoạt động ổn định',
                    )}
                  </Text>
                </div>
              </Space>
            </Card>
          )}
        </Col>

        <Col xs={24} md={pendingKycCount > 0 ? 10 : 12}>
          <Card
            variant="borderless"
            className="rounded-xl shadow-xs bg-slate-50 border border-slate-200/60 p-2"
          >
            <div className="flex items-center justify-between">
              <Space align="center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <Text strong className="text-slate-800 text-sm block">
                    {t(
                      'dashboard.systemStatusOnline',
                      'Hệ thống & API Realtime đang hoạt động ổn định',
                    )}
                  </Text>
                  <Text type="secondary" className="text-xs text-slate-500">
                    {isLoading
                      ? t('common.loading', 'Đang tải...')
                      : 'Socket & Background Workers Active'}
                  </Text>
                </div>
              </Space>
              <Link href={ADMIN_ROUTES.KYC} passHref>
                <Button
                  type="link"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  className="text-xs font-semibold"
                >
                  <IdcardOutlined className="mr-1" />
                  {t('nav.kyc', 'Duyệt eKYC')}
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
