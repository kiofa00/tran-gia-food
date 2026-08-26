'use client';

import React from 'react';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileImageOutlined,
  IdcardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Col, Descriptions, Drawer, Image, Row, Space, Typography } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import { formatDateTime } from '@/utils';

import type { KycRecord } from '../types';
import { KycStatusBadge } from './KycStatusBadge';

const { Text, Title } = Typography;

interface KycReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  record: KycRecord | null;
  getVehicleLabel: (type: string) => string;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
  showRejectInput: boolean;
  setShowRejectInput: (val: boolean) => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
}

export function KycReviewDrawer({
  open,
  onClose,
  record,
  getVehicleLabel,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  showRejectInput,
  setShowRejectInput,
  rejectReason,
  setRejectReason,
}: KycReviewDrawerProps) {
  const { t } = useLocale();

  if (!record) return null;

  const renderStatusBanner = () => {
    if (record.status === 'REJECTED') {
      return (
        <Alert
          type="error"
          showIcon
          icon={<CloseCircleOutlined className="text-red-500 text-lg" />}
          className="rounded-xl border border-red-200 bg-red-50/90 p-4"
          message={
            <Text strong className="text-red-900 block text-sm">
              {t('kyc.rejectedBannerTitle', 'Hồ sơ eKYC này đã bị từ chối')}
            </Text>
          }
          description={
            <div className="mt-1.5 text-xs text-red-800 bg-white/70 rounded-lg p-2.5 border border-red-100">
              <span className="font-semibold text-red-900">
                {t('kyc.rejectReasonLabel', 'Lý do từ chối')}:{' '}
              </span>
              <span>
                {record.rejectReason ||
                  t(
                    'kyc.defaultRejectReason',
                    'Ảnh chụp giấy tờ hoặc thông tin xác minh không đạt tiêu chuẩn eKYC',
                  )}
              </span>
            </div>
          }
        />
      );
    }

    if (record.status === 'APPROVED') {
      return (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined className="text-emerald-500 text-lg" />}
          className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4"
          message={
            <Text strong className="text-emerald-900 block text-sm">
              {t('kyc.approvedBannerTitle', 'Hồ sơ eKYC đã được phê duyệt')}
            </Text>
          }
          description={
            <Text className="text-xs text-emerald-700 block mt-1">
              {t(
                'kyc.approvedBannerDesc',
                'Tài xế đã được kích hoạt và có thể nhận đơn giao hàng trên toàn hệ thống.',
              )}
            </Text>
          }
        />
      );
    }

    return (
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined className="text-amber-500 text-lg" />}
        className="rounded-xl border border-amber-200 bg-amber-50/80 p-4"
        message={
          <Text strong className="text-amber-900 block text-sm">
            {t('kyc.pendingBannerTitle', 'Hồ sơ đang chờ thẩm định')}
          </Text>
        }
        description={
          <Text className="text-xs text-amber-700 block mt-1">
            {t(
              'kyc.pendingBannerDesc',
              'Vui lòng đối chiếu kỹ thông tin CCCD, bằng lái xe và ảnh selfie trước khi duyệt.',
            )}
          </Text>
        }
      />
    );
  };

  const renderFooter = () => {
    if (showRejectInput) {
      return (
        <Space className="w-full justify-end" wrap>
          <textarea
            className="border rounded px-3 py-2 w-72 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            rows={2}
            placeholder={t('kyc.rejectPlaceholder', 'Nhập lý do từ chối...')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <Button
            danger
            type="primary"
            onClick={onReject}
            loading={isRejecting}
            icon={<CloseCircleOutlined />}
          >
            {t('kyc.confirmReject', 'Xác nhận từ chối')}
          </Button>
          <Button onClick={() => setShowRejectInput(false)}>{t('common.cancel', 'Hủy')}</Button>
        </Space>
      );
    }

    return (
      <div className="flex items-center justify-between w-full">
        <Button onClick={onClose}>{t('kyc.closeDrawer', 'Đóng')}</Button>

        <Space wrap>
          {record.status === 'PENDING' && (
            <>
              <Button
                danger
                onClick={() => setShowRejectInput(true)}
                icon={<CloseCircleOutlined />}
              >
                {t('kyc.rejectBtn', 'Từ chối')}
              </Button>
              <Button
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-500 border-none font-medium"
                onClick={onApprove}
                loading={isApproving}
                icon={<CheckCircleOutlined />}
              >
                {t('kyc.approveBtn', 'Duyệt KYC')}
              </Button>
            </>
          )}

          {record.status === 'APPROVED' && (
            <Button danger onClick={() => setShowRejectInput(true)} icon={<CloseCircleOutlined />}>
              {t('kyc.rejectBtn', 'Từ chối hồ sơ')}
            </Button>
          )}

          {record.status === 'REJECTED' && (
            <Button
              type="primary"
              className="bg-emerald-600 hover:bg-emerald-500 border-none font-medium"
              onClick={onApprove}
              loading={isApproving}
              icon={<CheckCircleOutlined />}
            >
              {t('kyc.reApproveBtn', 'Duyệt lại hồ sơ')}
            </Button>
          )}
        </Space>
      </div>
    );
  };

  return (
    <Drawer
      title={
        <Space>
          <IdcardOutlined className="text-orange-500 text-lg" />
          <span>
            {t('kyc.detailTitle', 'Hồ Sơ KYC')} — {record.name}
          </span>
          <KycStatusBadge status={record.status} />
        </Space>
      }
      width={680}
      open={open}
      onClose={onClose}
      footer={renderFooter()}
    >
      <Space direction="vertical" className="w-full" size="large">
        {/* Status banner */}
        {renderStatusBanner()}

        {/* Personal info */}
        <Descriptions
          title={t('kyc.personalInfoTitle', 'Thông tin cá nhân')}
          bordered
          size="small"
          column={1}
          className="bg-white rounded-lg shadow-2xs"
        >
          <Descriptions.Item label={t('users.fullName', 'Họ và tên')}>
            <Text strong className="text-slate-900">
              {record.name}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('kyc.phone', 'Số điện thoại')}>
            <Text copyable>{record.phone}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('kyc.cccd', 'Số CCCD')}>
            <Text code>{record.cccd || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('kyc.vehicle', 'Phương tiện')}>
            {getVehicleLabel(record.vehicleType)}
          </Descriptions.Item>
          <Descriptions.Item label={t('kyc.submittedDate', 'Ngày nộp hồ sơ')}>
            {formatDateTime(record.submittedAt)}
          </Descriptions.Item>
          {(record.status === 'REJECTED' || record.rejectReason) && (
            <Descriptions.Item label={t('kyc.rejectReasonLabel', 'Lý do từ chối')}>
              <Text type="danger" strong className="block">
                {record.rejectReason ||
                  t(
                    'kyc.defaultRejectReason',
                    'Ảnh chụp giấy tờ hoặc thông tin xác minh không đạt tiêu chuẩn eKYC',
                  )}
              </Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Document images */}
        <div>
          <Title level={5} className="mb-3">
            <FileImageOutlined className="mr-2 text-orange-500" />
            {t('kyc.documentsTitle', 'Ảnh giấy tờ')}
          </Title>
          <Row gutter={[12, 12]}>
            {[
              {
                label: t('kyc.cccdFront', 'CCCD mặt trước'),
                url: record.cccdFrontUrl,
              },
              {
                label: t('kyc.cccdBack', 'CCCD mặt sau'),
                url: record.cccdBackUrl,
              },
              {
                label: t('kyc.driverLicense', 'Bằng lái xe'),
                url: record.driverLicenseUrl,
              },
              {
                label: t('kyc.vehicleReg', 'Đăng ký xe'),
                url: record.vehicleRegUrl,
              },
            ].map((doc) => (
              <Col span={12} key={doc.label}>
                <div className="border rounded-lg overflow-hidden bg-slate-50">
                  {doc.url ? (
                    <Image
                      src={doc.url}
                      alt={doc.label}
                      className="w-full object-cover"
                      style={{ height: 140 }}
                    />
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center bg-slate-100 text-slate-400"
                      style={{ height: 140 }}
                    >
                      <FileImageOutlined style={{ fontSize: 32 }} />
                      <div className="text-xs mt-2 text-slate-500">
                        {t('kyc.noImage', 'Chưa có ảnh')}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-center py-2 text-slate-600 bg-slate-100 border-t font-medium">
                    {doc.label}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Selfie */}
        <div>
          <Title level={5} className="mb-3">
            <UserOutlined className="mr-2 text-orange-500" />
            {t('kyc.selfie', 'Ảnh selfie xác minh')}
          </Title>
          {record.selfieUrl ? (
            <Image
              src={record.selfieUrl}
              alt="Selfie"
              style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center bg-slate-100 border border-dashed border-slate-300 rounded-full text-slate-400"
              style={{ width: 140, height: 140 }}
            >
              <UserOutlined style={{ fontSize: 36 }} />
              <div className="text-xs mt-2 text-slate-500">
                {t('kyc.noSelfie', 'Chưa có selfie')}
              </div>
            </div>
          )}
        </div>
      </Space>
    </Drawer>
  );
}
