'use client';

import Link from 'next/link';

import {
  ArrowLeftOutlined,
  CarOutlined,
  HomeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Result, Space, Typography } from 'antd';

import { ADMIN_ROUTES } from '@/shared-config';

const { Title, Paragraph, Text } = Typography;

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-screen p-8">
      <Card className="max-w-2xl w-full text-center rounded-xl shadow-lg border border-gray-200">
        <Result
          status="404"
          title={
            <Title level={2} className="text-orange-500 m-0">
              404 — Không Tìm Thấy Trang
            </Title>
          }
          subTitle={
            <Paragraph type="secondary" className="text-base mt-2">
              Rất tiếc! Trang bạn đang truy cập không tồn tại hoặc đã đổi sang đường dẫn khác trong
              hệ thống <strong>Tran Gia Food Admin</strong>.
            </Paragraph>
          }
          extra={
            <Space direction="vertical" size="middle" className="w-full mt-3">
              <Space wrap align="center" className="justify-center">
                <Link href={ADMIN_ROUTES.HOME}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<HomeOutlined />}
                    className="bg-orange-500 h-11 px-6 font-semibold"
                  >
                    Về Trang Chủ Dashboard
                  </Button>
                </Link>
                <Link href={ADMIN_ROUTES.FLEET}>
                  <Button size="large" icon={<CarOutlined />} className="h-11 px-6 font-semibold">
                    Giám Sát Đội Xe
                  </Button>
                </Link>
                <Button
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.history.back()}
                  className="h-11 px-6"
                >
                  Quay Lại
                </Button>
              </Space>

              <div className="bg-white rounded-md p-4 text-left mt-4 border border-dashed border-gray-200">
                <Text strong className="text-gray-900">
                  <QuestionCircleOutlined className="mr-2 text-orange-500" />
                  Gợi Ý Hỗ Trợ:
                </Text>
                <ul className="mt-2 ml-5 p-0 text-gray-500 text-sm list-disc">
                  <li>Kiểm tra lại đường dẫn URL trên thanh địa chỉ trình duyệt.</li>
                  <li>
                    Nếu bạn vừa nhấp vào một liên kết từ trang khác, liên kết đó có thể bị hỏng.
                  </li>
                  <li>Liên hệ với bộ phận Kỹ thuật Tran Gia Food nếu sự cố tiếp tục xảy ra.</li>
                </ul>
              </div>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
