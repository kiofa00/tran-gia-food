'use client';

import React from 'react';

import { Card, Empty, Space, Spin, Typography } from 'antd';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { PaymentMethodItem } from '@/types';

const { Text } = Typography;

interface PaymentSplitChartProps {
  paymentData: PaymentMethodItem[];
  loading: boolean;
}

export const PaymentSplitChart: React.FC<PaymentSplitChartProps> = ({ paymentData, loading }) => {
  return (
    <Card
      title="💳 Phân Bố Phương Thức Thanh Toán"
      variant="borderless"
      className="rounded-xl shadow-xs"
    >
      <div className="w-full h-80 flex items-center justify-center">
        {loading && (
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text type="secondary">Đang tải dữ liệu...</Text>
          </Space>
        )}
        {!loading && paymentData.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu thanh toán" />
        )}
        {!loading && paymentData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `${val}% tổng đơn`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
