'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { App, Button, Card, Checkbox, Form, Input, Skeleton, Typography } from 'antd';

import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROUTES, STORAGE_KEY_REMEMBERED_EMAIL } from '@/shared-config';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
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
        // NextAuth trả 'CredentialsSignin' khi authorize() return null (sai credential)
        // Các lỗi khác (Configuration, Default...) thường do server/infra
        if (result.error === 'CredentialsSignin') {
          message.error('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } else {
          message.error('Máy chủ đang gặp sự cố. Vui lòng thử lại sau.');
        }
      } else {
        message.success('Đăng nhập thành công!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-md rounded-2xl shadow-2xl border-0"
      styles={{ body: { padding: '40px 36px' } }}
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🍜</div>
        <Title level={3} className="m-0 text-orange-500">
          Tran Gia Food
        </Title>
        <Text type="secondary">Cổng Admin quản trị hệ thống</Text>
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
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
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
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
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
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
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
                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </Button>
            </Form.Item>
          </Form>
        )}
      </App>

      <div className="text-center mt-6">
        <Text type="secondary" className="text-xs">
          Chỉ dành cho Quản Trị Viên Trần Gia Food
        </Text>
      </div>
    </Card>
  );
}
