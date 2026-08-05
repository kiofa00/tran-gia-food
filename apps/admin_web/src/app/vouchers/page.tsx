'use client';

import React, { useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Space, Typography, message, Switch, Tooltip } from 'antd';
import {
  TagOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';
import { formatCurrency } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface VoucherRecord {
  key: string;
  code: string;
  type: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  validFrom: string;
  validTo: string;
  usedCount: number;
  totalLimit: number;
  isActive: boolean;
}

export default function VoucherManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([]);

  React.useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/vouchers');
      if (res.ok) {
        const data = await res.json();
        setVouchers(
          data.map((item: any, idx: number) => ({
            key: item.id || String(idx + 1),
            code: item.code,
            type: item.type || 'Platform',
            discountType: item.discountType || 'fixed',
            discountValue: item.discountValue || 50000,
            minOrderValue: item.minOrderValue || 100000,
            validFrom: item.validFrom || '2026-08-01',
            validTo: item.validTo || '2026-08-31',
            usedCount: item.usedCount || 0,
            totalLimit: item.totalLimit || 500,
            isActive: item.isActive !== undefined ? item.isActive : true,
          })),
        );
      } else {
        throw new Error();
      }
    } catch {
      setVouchers([
        {
          key: '1',
          code: 'TRANGIA50K',
          type: 'Platform',
          discountType: 'fixed',
          discountValue: 50000,
          minOrderValue: 150000,
          validFrom: '2026-08-01',
          validTo: '2026-08-31',
          usedCount: 142,
          totalLimit: 500,
          isActive: true,
        },
        {
          key: '2',
          code: 'FREESHIP20',
          type: 'FreeShip',
          discountType: 'fixed',
          discountValue: 20000,
          minOrderValue: 80000,
          validFrom: '2026-08-05',
          validTo: '2026-08-20',
          usedCount: 89,
          totalLimit: 300,
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const handleToggleActive = (key: string, checked: boolean) => {
    setVouchers((prev) =>
      prev.map((item) => (item.key === key ? { ...item, isActive: checked } : item))
    );
    message.success(`Đã ${checked ? 'kích hoạt' : 'tạm dừng'} mã giảm giá thành công!`);
  };

  const handleCreateVoucher = (values: any) => {
    const newVoucher: VoucherRecord = {
      key: Date.now().toString(),
      code: values.code.toUpperCase(),
      type: values.type || 'Platform',
      discountType: values.discountType,
      discountValue: values.discountValue,
      maxDiscount: values.maxDiscount,
      minOrderValue: values.minOrderValue || 0,
      validFrom: values.validDates ? values.validDates[0].format('YYYY-MM-DD') : '2026-08-05',
      validTo: values.validDates ? values.validDates[1].format('YYYY-MM-DD') : '2026-08-31',
      usedCount: 0,
      totalLimit: values.totalLimit || 100,
      isActive: true,
    };

    setVouchers([newVoucher, ...vouchers]);
    setIsModalOpen(false);
    form.resetFields();
    message.success(`Tạo mã giảm giá ${newVoucher.code} thành công!`);
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string) => (
        <Tag color="volcano" icon={<TagOutlined />} style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Loại Ưu Đãi',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 180,
      render: (type: string, record: VoucherRecord) => (
        <Space style={{ whiteSpace: 'nowrap' }}>
          {type === 'percent' ? (
            <Tag color="purple" icon={<PercentageOutlined />}>
              Giảm {record.discountValue}% {record.maxDiscount ? `(Tối đa ${formatCurrency(record.maxDiscount)})` : ''}
            </Tag>
          ) : (
            <Tag color="green" icon={<DollarOutlined />}>
              Giảm {formatCurrency(record.discountValue)}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Đơn Tối Thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      width: 150,
      render: (val: number) => <Text style={{ whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Hạn Sử Dụng',
      key: 'validity',
      width: 210,
      render: (record: VoucherRecord) => (
        <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
          <ClockCircleOutlined style={{ marginRight: 6 }} />
          {record.validFrom} ➔ {record.validTo}
        </Text>
      ),
    },
    {
      title: 'Lượt Sử Dụng',
      key: 'usage',
      width: 160,
      render: (record: VoucherRecord) => (
        <Text style={{ whiteSpace: 'nowrap' }}>
          <Text strong>{record.usedCount}</Text> / {record.totalLimit} lượt
        </Text>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 150,
      render: (record: VoucherRecord) => {
        const isExpired = new Date(record.validTo) < new Date('2026-08-05');
        if (isExpired) {
          return <Tag color="default" icon={<CloseCircleOutlined />}>Đã hết hạn</Tag>;
        }
        return record.isActive ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Đang diễn ra</Tag>
        ) : (
          <Tag color="warning">Tạm dừng</Tag>
        );
      },
    },
    {
      title: 'Kích Hoạt',
      key: 'action',
      width: 120,
      render: (record: VoucherRecord) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggleActive(record.key, checked)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
  ];

  return (
    <div style={{ padding: adminDesignTokens.padding.lg }}>
      {/* Header & Create Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
            🎟️ Quản Lý Mã Giảm Giá & Khuyến Mãi
          </Title>
          <Text type="secondary">Tạo mới, thiết lập hạn mức và theo dõi hiệu quả các chương trình Voucher toàn sàn</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: adminDesignTokens.colors.primary, fontWeight: 600 }}
        >
          Tạo Mã Voucher Mới
        </Button>
      </div>

      {/* Voucher Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={vouchers} pagination={false} scroll={{ x: 1130 }} />
      </Card>

      {/* Modal Form: Create Voucher */}
      <Modal
        title="✨ Tạo Mã Giảm Giá Mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo Voucher"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: adminDesignTokens.colors.primary } }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateVoucher} initialValues={{ discountType: 'fixed', type: 'Platform' }}>
          <Form.Item name="code" label="Mã Voucher (Code)" rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}>
            <Input placeholder="VD: TRANGIA50K" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="discountType" label="Loại Khuyến Mãi" rules={[{ required: true }]}>
              <Select style={{ width: 180 }}>
                <Option value="fixed">Giảm tiền cố định (đ)</Option>
                <Option value="percent">Giảm theo phần trăm (%)</Option>
              </Select>
            </Form.Item>

            <Form.Item name="discountValue" label="Giá Trị Giảm" rules={[{ required: true, message: 'Nhập giá trị' }]}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 50000 hoặc 15" />
            </Form.Item>
          </Space>

          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="minOrderValue" label="Đơn Hàng Tối Thiểu (đ)">
              <InputNumber min={0} style={{ width: 180 }} placeholder="VD: 100000" />
            </Form.Item>

            <Form.Item name="totalLimit" label="Số Lượng Lượt Dùng">
              <InputNumber min={1} style={{ width: 180 }} placeholder="VD: 500" />
            </Form.Item>
          </Space>

          <Form.Item name="validDates" label="Thời Gian Hiệu Lực" rules={[{ required: true, message: 'Chọn khoảng thời gian' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
