'use client';

import React, { useEffect, useState } from 'react';

import {
  CheckCircleOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';

import { useLocale } from '@/hooks/useLocale';
import { authService } from '@/services/auth.service';

const { Text, Title } = Typography;

interface AdminProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ open, onClose }) => {
  const { t } = useLocale();
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      setLoading(true);
      authService
        .getMe()
        .then((data) => setProfile(data))
        .catch(() => {
          // Fallback to basic state
          setProfile({
            id: 'admin-01',
            email: 'admin@trangiafood.vn',
            name: 'Tran Gia Admin',
            phone: '0901234567',
            role: 'ADMIN',
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error(t('common.errorTryAgain', 'Mật khẩu xác nhận không khớp!'));

      return;
    }

    try {
      setSubmittingPassword(true);
      await authService.changePassword(values.currentPassword, values.newPassword);
      message.success(t('common.success', 'Đổi mật khẩu thành công!'));
      form.resetFields();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('common.errorTryAgain', 'Đổi mật khẩu thất bại, vui lòng thử lại.');

      message.error(msg);
    } finally {
      setSubmittingPassword(false);
    }
  };

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : 'A';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden
      centered
      title={
        <Space>
          <UserOutlined className="text-orange-500 text-lg" />
          <span>{t('header.profile', 'Hồ sơ cá nhân')}</span>
        </Space>
      }
    >
      <div className="py-2">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 bg-orange-50/60 p-4 rounded-xl border border-orange-100 mb-6">
          <Avatar size={64} className="bg-orange-500 text-white text-2xl font-bold shrink-0">
            {initial}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Title level={4} className="!mb-0 text-slate-800">
                {profile?.name || 'Administrator'}
              </Title>
              <Tag color="orange" icon={<SafetyOutlined />}>
                {profile?.role || 'ADMIN'}
              </Tag>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {t('users.active', 'Đang hoạt động')}
              </Tag>
            </div>
            <Text type="secondary" className="block text-xs mt-1">
              <MailOutlined className="mr-1" /> {profile?.email || 'admin@trangiafood.vn'}
            </Text>
          </div>
        </div>

        {/* Tabs for Info & Change Password */}
        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: 'info',
              label: (
                <Space>
                  <UserOutlined />
                  <span>{t('common.details', 'Thông tin tài khoản')}</span>
                </Space>
              ),
              children: (
                <Card loading={loading} className="border-slate-200">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label={t('restaurants.owner', 'Họ và tên')}>
                      <Text strong>{profile?.name || '—'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('auth.phoneOrEmail', 'Địa chỉ Email')}>
                      <Text copyable>{profile?.email || '—'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('restaurants.phone', 'Số điện thoại')}>
                      <Text>
                        <PhoneOutlined className="mr-1 text-slate-400" />
                        {profile?.phone || '0901234567'}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('header.adminRole', 'Phân quyền')}>
                      <Tag color="volcano">{profile?.role || 'ADMIN'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('restaurants.status', 'Trạng thái')}>
                      <Tag color="success">
                        {profile?.isActive !== false
                          ? t('restaurants.active', 'Đang hoạt động')
                          : t('common.inactive', 'Tạm khóa')}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ),
            },
            {
              key: 'security',
              label: (
                <Space>
                  <KeyOutlined />
                  <span>{t('header.settings', 'Đổi mật khẩu')}</span>
                </Space>
              ),
              children: (
                <div className="p-2">
                  <Text type="secondary" className="block mb-4 text-xs">
                    Để bảo mật tài khoản quản trị viên, mật khẩu mới cần có độ dài tối thiểu 6 ký
                    tự.
                  </Text>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    requiredMark={false}
                  >
                    <Form.Item
                      name="currentPassword"
                      label={t('auth.password', 'Mật khẩu hiện tại')}
                      rules={[
                        {
                          required: true,
                          message: t('auth.passwordRequired', 'Vui lòng nhập mật khẩu hiện tại!'),
                        },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder="Nhập mật khẩu hiện tại..."
                      />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                      ]}
                    >
                      <Input.Password
                        prefix={<KeyOutlined className="text-slate-400" />}
                        placeholder="Nhập mật khẩu mới (>= 6 ký tự)..."
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu mới"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }

                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<KeyOutlined className="text-slate-400" />}
                        placeholder="Nhập lại mật khẩu mới..."
                      />
                    </Form.Item>

                    <Divider className="my-4" />

                    <div className="flex justify-end gap-2">
                      <Button onClick={() => form.resetFields()}>
                        {t('common.cancel', 'Hủy')}
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={submittingPassword}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {t('common.save', 'Cập nhật mật khẩu')}
                      </Button>
                    </div>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};
