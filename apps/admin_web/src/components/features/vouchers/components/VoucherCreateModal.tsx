'use client';

import { DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import { Modal } from 'antd';

import type { CreateVoucherFormValues } from '../types';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface VoucherCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateVoucherFormValues) => void;
  confirmLoading?: boolean;
}

export function VoucherCreateModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading,
}: VoucherCreateModalProps) {
  const [form] = Form.useForm<CreateVoucherFormValues>();

  const handleOk = () => form.submit();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="✨ Tạo Mã Giảm Giá Mới"
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Tạo Voucher"
      cancelText="Hủy"
      confirmLoading={confirmLoading}
      okButtonProps={{ className: 'bg-orange-500 font-semibold' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit(values);
          form.resetFields();
        }}
        initialValues={{ discountType: 'fixed', type: 'Platform' }}
      >
        <Form.Item
          name="code"
          label="Mã Voucher (Code)"
          rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}
        >
          <Input placeholder="VD: TRANGIA50K" className="uppercase" />
        </Form.Item>

        <Space size="middle" className="flex">
          <Form.Item name="discountType" label="Loại Khuyến Mãi" rules={[{ required: true }]}>
            <Select className="w-44">
              <Option value="fixed">Giảm tiền cố định (đ)</Option>
              <Option value="percent">Giảm theo phần trăm (%)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discountValue"
            label="Giá Trị Giảm"
            rules={[{ required: true, message: 'Nhập giá trị' }]}
          >
            <InputNumber min={1} className="w-full" placeholder="VD: 50000 hoặc 15" />
          </Form.Item>
        </Space>

        <Space size="middle" className="flex">
          <Form.Item name="minOrderValue" label="Đơn Hàng Tối Thiểu (đ)">
            <InputNumber min={0} className="w-44" placeholder="VD: 100000" />
          </Form.Item>

          <Form.Item name="totalLimit" label="Số Lượng Lượt Dùng">
            <InputNumber min={1} className="w-44" placeholder="VD: 500" />
          </Form.Item>
        </Space>

        <Form.Item
          name="validDates"
          label="Thời Gian Hiệu Lực"
          rules={[{ required: true, message: 'Chọn khoảng thời gian' }]}
        >
          <RangePicker className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
