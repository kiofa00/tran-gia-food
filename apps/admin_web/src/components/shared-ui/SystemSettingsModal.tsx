'use client';

import React from 'react';

import {
  AppstoreOutlined,
  DollarOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Spin,
  Switch,
  Typography,
} from 'antd';

import { SYSTEM_SETTINGS_LIMITS } from '@/shared-config';
import { formatThousands, parseThousands } from '@/utils/formatters';

import { useSystemSettingsModal } from './hooks/useSystemSettingsModal';

const { Text } = Typography;

interface SystemSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ open, onClose }) => {
  const { form, loading, saving, loadConfigs, handleSave, t } = useSystemSettingsModal({
    open,
    onClose,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnHidden
      centered
      title={
        <Space>
          <SettingOutlined className="text-orange-500 text-lg" />
          <span>{t('header.settings', 'Cài đặt hệ thống')}</span>
        </Space>
      }
    >
      <div className="py-2">
        <Alert
          message={t('cms.serverStatus', 'Thông số vận hành thời gian thực')}
          description={t(
            'settings.serverStatusDesc',
            'Các tham số bên dưới ảnh hưởng trực tiếp đến thuật toán tính phí ship, hoa hồng nền tảng và luồng tiếp nhận đơn hàng.',
          )}
          type="info"
          showIcon
          className="mb-6"
        />

        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <Spin spinning={loading}>
            <Row gutter={[16, 0]}>
              {/* Phí & Tài chính */}
              <Col xs={24}>
                <Divider orientation="left" className="!my-2">
                  <Space>
                    <DollarOutlined className="text-orange-500" />
                    <Text strong>{t('settings.financialTitle', 'Tài Chính & Hoa Hồng')}</Text>
                  </Space>
                </Divider>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="platform_fee_rate"
                  label={t('settings.platformFeeRate', 'Hoa hồng nền tảng mặc định (%)')}
                  tooltip={t(
                    'settings.platformFeeTooltip',
                    'Tỷ lệ % chiết khấu trích từ doanh thu món ăn của nhà hàng đối tác',
                  )}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={SYSTEM_SETTINGS_LIMITS.PLATFORM_FEE_MIN}
                    max={SYSTEM_SETTINGS_LIMITS.PLATFORM_FEE_MAX}
                    suffix="%"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="base_ship_fee"
                  label={t('settings.baseShipFee', 'Phí ship cơ bản 2km đầu (VND)')}
                  tooltip={t(
                    'settings.baseShipFeeTooltip',
                    'Cước vận chuyển cố định cho phạm vi bán kính 2km đầu tiên',
                  )}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={SYSTEM_SETTINGS_LIMITS.BASE_SHIP_FEE_MIN}
                    step={SYSTEM_SETTINGS_LIMITS.BASE_SHIP_FEE_STEP}
                    formatter={formatThousands}
                    parser={(v) => parseThousands(v) as unknown as number}
                    suffix="đ"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="ship_fee_per_km"
                  label={t('settings.shipFeePerKm', 'Phí ship mỗi km tiếp theo (VND)')}
                  tooltip={t(
                    'settings.shipFeePerKmTooltip',
                    'Cước vận chuyển cộng dồn thêm cho mỗi km vượt quá 2km',
                  )}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={SYSTEM_SETTINGS_LIMITS.SHIP_FEE_PER_KM_MIN}
                    step={SYSTEM_SETTINGS_LIMITS.SHIP_FEE_PER_KM_STEP}
                    formatter={formatThousands}
                    parser={(v) => parseThousands(v) as unknown as number}
                    suffix="đ/km"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="shipper_countdown_seconds"
                  label={t('settings.shipperCountdown', 'Thời gian đếm ngược nhận đơn (Giây)')}
                  tooltip={t(
                    'settings.shipperCountdownTooltip',
                    'Thời gian tối đa để 1 tài xế bấm Chấp nhận đơn trước khi chuyển tiếp cho tài xế khác',
                  )}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={SYSTEM_SETTINGS_LIMITS.COUNTDOWN_MIN}
                    max={SYSTEM_SETTINGS_LIMITS.COUNTDOWN_MAX}
                    suffix="giây"
                    className="w-full"
                  />
                </Form.Item>
              </Col>

              {/* Vận hành & Bảo mật */}
              <Col xs={24}>
                <Divider orientation="left" className="!my-2">
                  <Space>
                    <SafetyOutlined className="text-orange-500" />
                    <Text strong>{t('settings.operationTitle', 'Vận Hành & Ứng Dụng')}</Text>
                  </Space>
                </Divider>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="hotline_support"
                  label={t('settings.hotline', 'Hotline tổng đài CSKH 24/7')}
                  rules={[{ required: true }]}
                >
                  <Input prefix={<PhoneOutlined className="text-slate-400" />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="app_version_min"
                  label={t('settings.appVersionMin', 'Phiên bản ứng dụng tối thiểu')}
                  tooltip={t(
                    'settings.appVersionTooltip',
                    'Phiên bản app Flutter yêu cầu cập nhật bắt buộc',
                  )}
                  rules={[{ required: true }]}
                >
                  <Input prefix={<AppstoreOutlined className="text-slate-400" />} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Card size="small" className="bg-slate-50 border-slate-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong className="block">
                        {t('settings.autoApproveKyc', 'Tự động phê duyệt hồ sơ eKYC tài xế')}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {t(
                          'settings.autoApproveKycDesc',
                          'Khi bật, hệ thống tự động kích hoạt tài khoản tài xế sau khi họ upload đủ giấy tờ CCCD.',
                        )}
                      </Text>
                    </div>
                    <Form.Item name="kyc_auto_approval" valuePropName="checked" className="!mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider className="my-3" />

            <div className="flex justify-between items-center">
              <Button icon={<ReloadOutlined />} onClick={loadConfigs}>
                {t('settings.reloadBtn', 'Tải lại')}
              </Button>
              <Space>
                <Button onClick={onClose}>{t('common.cancel', 'Đóng')}</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {t('settings.saveBtn', 'Lưu Cài Đặt')}
                </Button>
              </Space>
            </div>
          </Spin>
        </Form>
      </div>
    </Modal>
  );
};
