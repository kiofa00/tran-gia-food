'use client';

import React, { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import { signIn } from 'next-auth/react';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        message.error('Email hoac mat khau khong dung. Vui long thu lai.');
      } else {
        message.success('Dang nhap thanh cong!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      message.error('Co loi xay ra. Vui long thu lai.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD700 100%)',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: 'none',
        }}
        styles={{ body: { padding: '40px 36px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🍜</div>
          <Title level={3} style={{ margin: 0, color: '#FF6B35' }}>
            Tran Gia Food
          </Title>
          <Text type="secondary">Cong Admin quan tri he thong</Text>
        </div>

        <App>
          <Form
            id="admin-login-form"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui long nhap email' },
                { type: 'email', message: 'Email khong hop le' },
              ]}
            >
              <Input
                id="admin-email-input"
                prefix={<MailOutlined style={{ color: '#FF6B35' }} />}
                placeholder="admin@trangiafood.vn"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mat khau"
              rules={[{ required: true, message: 'Vui long nhap mat khau' }]}
            >
              <Input.Password
                id="admin-password-input"
                prefix={<LockOutlined style={{ color: '#FF6B35' }} />}
                placeholder="Nhap mat khau"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                id="admin-login-submit"
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                style={{
                  background: 'linear-gradient(90deg, #FF6B35, #F7931E)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 48,
                }}
              >
                {isLoading ? 'Dang dang nhap...' : 'Dang Nhap'}
              </Button>
            </Form.Item>
          </Form>
        </App>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Chi danh cho Quan Tri Vien Tran Gia Food
          </Text>
        </div>
      </Card>
    </div>
  );
}
