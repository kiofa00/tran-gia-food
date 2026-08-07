'use client';

import { DatePicker, Form, Input, InputNumber, Modal, Select, Space } from 'antd';

import { useTranslation } from '@/providers/LanguageProvider';

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
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateVoucherFormValues>();

  const handleOk = () => form.submit();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('vouchers.modalTitle', '✨ Tạo Mã Giảm Giá Mới')}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={t('vouchers.createModalSubmit', 'Tạo Voucher')}
      cancelText={t('common.cancel', 'Hủy')}
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
          label={t('vouchers.codeLabel', 'Mã Voucher (Code)')}
          rules={[
            { required: true, message: t('vouchers.codeRequired', 'Vui lòng nhập mã voucher') },
          ]}
        >
          <Input
            placeholder={t('vouchers.codePlaceholder', 'VD: TRANGIA50K')}
            className="uppercase"
          />
        </Form.Item>

        <Space size="middle" className="flex">
          <Form.Item
            name="discountType"
            label={t('vouchers.discountTypeLabel', 'Loại Khuyến Mãi')}
            rules={[{ required: true }]}
          >
            <Select className="w-44">
              <Option value="fixed">{t('vouchers.typeFixed', 'Giảm tiền cố định (đ)')}</Option>
              <Option value="percent">
                {t('vouchers.typePercent', 'Giảm theo phần trăm (%)')}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discountValue"
            label={t('vouchers.discountValueLabel', 'Giá Trị Giảm')}
            rules={[
              { required: true, message: t('vouchers.discountValueRequired', 'Nhập giá trị') },
            ]}
          >
            <InputNumber
              min={1}
              className="w-full"
              placeholder={t('vouchers.discountValuePlaceholder', 'VD: 50000 hoặc 15')}
            />
          </Form.Item>
        </Space>

        <Space size="middle" className="flex">
          <Form.Item
            name="minOrderValue"
            label={t('vouchers.minOrderLabel', 'Đơn Hàng Tối Thiểu (đ)')}
          >
            <InputNumber
              min={0}
              className="w-44"
              placeholder={t('vouchers.minOrderPlaceholder', 'VD: 100000')}
            />
          </Form.Item>

          <Form.Item name="totalLimit" label={t('vouchers.totalLimitLabel', 'Số Lượng Lượt Dùng')}>
            <InputNumber
              min={1}
              className="w-44"
              placeholder={t('vouchers.totalLimitPlaceholder', 'VD: 500')}
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="validDates"
          label={t('vouchers.validDatesLabel', 'Thời Gian Hiệu Lực')}
          rules={[
            { required: true, message: t('vouchers.validDatesRequired', 'Chọn khoảng thời gian') },
          ]}
        >
          <RangePicker className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
