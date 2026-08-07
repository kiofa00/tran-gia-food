'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { App, Button, Card, Checkbox, Form, Input, Skeleton, Typography } from 'antd';

import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/providers/LanguageProvider';
import { ADMIN_ROUTES, STORAGE_KEY_REMEMBERED_EMAIL } from '@/shared-config';
import { cn } from '@/utils/cn';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  // Khởi tạo null để phân biệt "chưa mount" vs "không có giá trị"
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') ?? ADMIN_ROUTES.HOME;

  // Đọc localStorage SAU khi mount để tránh SSR/client hydration mismatch
  useEffect(() => {
    const email = localStorage.getItem(STORAGE_KEY_REMEMBERED_EMAIL) ?? '';

    setSavedEmail(email);
  }, []);

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      if (values.remember) {
        localStorage.setItem(STORAGE_KEY_REMEMBERED_EMAIL, values.email);
      } else {
        localStorage.removeItem(STORAGE_KEY_REMEMBERED_EMAIL);
      }

      const result = await login({
        email: values.email,
        password: values.password,
        remember: values.remember,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          message.error(t('auth.loginFailed', 'Tài khoản hoặc mật khẩu không chính xác.'));
        } else {
          message.error(t('common.errorTryAgain', 'Thao tác thất bại, vui lòng thử lại.'));
        }
      } else {
        message.success(t('auth.loginSuccess', 'Đăng nhập thành công!'));
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      message.error(t('common.errorTryAgain', 'Thao tác thất bại, vui lòng thử lại.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn('w-full max-w-md rounded-2xl shadow-2xl border-0', className)}
      styles={{ body: { padding: '40px 36px' } }}
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🍜</div>
        <Title level={3} className="m-0 text-orange-500">
          Tran Gia Food
        </Title>
        <Text type="secondary">{t('auth.loginSubtitle', 'Tran Gia Food Admin Portal')}</Text>
      </div>

      <App>
        {savedEmail === null ? (
          /* Skeleton khớp layout Form: 2 input + checkbox + button */
          <div aria-hidden="true">
            <Skeleton.Input active block style={{ marginBottom: 24, height: 40 }} />
            <Skeleton.Input active block style={{ marginBottom: 24, height: 40 }} />
            <div style={{ marginBottom: 16 }}>
              <Skeleton.Button active style={{ width: 140, height: 22 }} />
            </div>
            <Skeleton.Button active block style={{ height: 48 }} />
          </div>
        ) : (
          <Form
            id="admin-login-form"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark={false}
            initialValues={{ email: savedEmail, remember: !!savedEmail }}
          >
            <Form.Item
              name="email"
              label={t('users.email', 'Email')}
              rules={[
                {
                  required: true,
                  message: t('auth.phoneOrEmailRequired', 'Vui lòng nhập SĐT hoặc Email!'),
                },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                id="admin-email-input"
                prefix={<MailOutlined className="text-orange-500" />}
                placeholder="admin@trangiafood.vn"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t('auth.password', 'Mật khẩu')}
              rules={[
                { required: true, message: t('auth.passwordRequired', 'Vui lòng nhập mật khẩu!') },
              ]}
            >
              <Input.Password
                id="admin-password-input"
                prefix={<LockOutlined className="text-orange-500" />}
                placeholder="Nhập mật khẩu"
                size="large"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t('auth.rememberMe', 'Ghi nhớ đăng nhập')}</Checkbox>
              </Form.Item>
            </div>

            <Form.Item className="mb-0">
              <Button
                id="admin-login-submit"
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                className="bg-linear-to-r from-orange-500 to-orange-400 border-0 rounded-lg font-semibold h-12"
              >
                {isLoading ? 'Đang đăng nhập...' : t('auth.submitLogin', 'Đăng Nhập Portal')}
              </Button>
            </Form.Item>
          </Form>
        )}
      </App>

      <div className="text-center mt-6">
        <Text type="secondary" className="text-xs">
          {t('header.adminRole', 'Quản trị viên hệ thống')}
        </Text>
      </div>
    </Card>
  );
}
