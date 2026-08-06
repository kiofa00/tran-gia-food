'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { CodeOutlined, HomeOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Result, Space, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to logging service (e.g. Sentry / CloudWatch)
    console.error('Unhandled Admin Web Runtime Error:', error);
  }, [error]);

  return (
    <div className="flex justify-center items-center min-h-[75vh] p-8">
      <Card className="max-w-2xl w-full text-center rounded-xl shadow-lg border border-gray-200">
        <Result
          status="500"
          title={
            <Title level={2} className="text-red-500 m-0">
              500 — Hệ Thống Gặp Sự Cố Xử Lý
            </Title>
          }
          subTitle={
            <Paragraph type="secondary" className="text-base mt-2">
              Rất tiếc! Đã có lỗi bất ngờ xảy ra trong quá trình xử lý giao diện Admin Web.
            </Paragraph>
          }
          extra={
            <Space direction="vertical" size="middle" className="w-full mt-3">
              <Space wrap align="center" className="justify-center">
                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => reset()}
                  className="bg-orange-500 h-11 px-6 font-semibold"
                >
                  Thử Tải Lại Trang
                </Button>
                <Link href="/">
                  <Button size="large" icon={<HomeOutlined />} className="h-11 px-6 font-semibold">
                    Về Trang Chủ Dashboard
                  </Button>
                </Link>
              </Space>

              {/* Collapsible Error Debug Details */}
              <div className="text-left mt-4">
                <Collapse
                  ghost
                  items={[
                    {
                      key: '1',
                      label: (
                        <Text type="secondary" className="text-xs">
                          <CodeOutlined className="mr-1.5" />
                          Chi tiết kỹ thuật (Developer Info)
                        </Text>
                      ),
                      children: (
                        <div className="bg-white p-3 rounded-md font-mono text-xs break-all text-red-600 border border-gray-100">
                          <Paragraph className="m-0 font-semibold">
                            <WarningOutlined className="mr-1.5" />
                            {error?.name || 'Error'}: {error?.message || 'Lỗi không xác định'}
                          </Paragraph>
                          {error?.digest && (
                            <Text type="secondary" className="block mt-1 text-[11px]">
                              Digest Hash: {error.digest}
                            </Text>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
