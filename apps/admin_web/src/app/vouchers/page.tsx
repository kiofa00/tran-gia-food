'use client';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Space, Typography, Switch, Tooltip, Empty, App } from 'antd';
import {
  TagOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
  DollarOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageContainer, PageHeader, SearchFilterBox, DataTable } from '../../components';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

import { VoucherRecord, CreateVoucherFormValues } from '../../types';
import { useVouchersQuery, useCreateVoucherMutation, useToggleVoucherMutation } from '../../hooks/useVouchers';

export default function VoucherManagementPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawVouchers, isLoading: loading } = useVouchersQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });
  const createVoucherMutation = useCreateVoucherMutation();
  const toggleVoucherMutation = useToggleVoucherMutation();

  const rawList = Array.isArray(rawVouchers) ? rawVouchers : (rawVouchers?.data || []);
  const vouchers: VoucherRecord[] = rawList.map((item: Record<string, unknown>, idx: number) => {
    const itemKey = String(item.id || item.key || idx + 1);
    return {
      key: itemKey,
      code: String(item.code || ''),
      type: String(item.type || 'Platform'),
      discountType: (item.discountType === 'percent' ? 'percent' : 'fixed'),
      discountValue: Number(item.discountValue) || 0,
      minOrderValue: Number(item.minOrderValue) || 0,
      validFrom: String(item.validFrom || ''),
      validTo: String(item.validTo || ''),
      usedCount: Number(item.usedCount) || 0,
      totalLimit: Number(item.totalLimit) || 0,
      isActive: statusOverrides[itemKey] !== undefined ? statusOverrides[itemKey] : (item.isActive !== undefined ? Boolean(item.isActive) : true),
    };
  });

  const filteredVouchers = vouchers.filter((item) => {
    const matchesSearch = !search || item.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && item.isActive) ||
      (statusFilter === 'INACTIVE' && !item.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = (key: string, checked: boolean) => {
    setStatusOverrides((prev) => ({ ...prev, [key]: checked }));
    toggleVoucherMutation.mutate({ id: key, isActive: checked });
    message.success(`Đã ${checked ? 'kích hoạt' : 'tạm dừng'} mã giảm giá thành công!`);
  };

  const handleCreateVoucher = (values: CreateVoucherFormValues) => {
    const payload = {
      code: values.code.toUpperCase(),
      type: values.type || 'Platform',
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrderValue: values.minOrderValue || 0,
      totalLimit: values.totalLimit || 100,
      validFrom: values.validDates ? values.validDates[0].format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
      validTo: values.validDates ? values.validDates[1].format('YYYY-MM-DD') : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };

    createVoucherMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        form.resetFields();
        message.success(`Tạo mã giảm giá ${payload.code} thành công!`);
      },
      onError: () => {
        message.error('Không thể tạo mã giảm giá');
      },
    });
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.code.localeCompare(b.code),
      render: (code: string) => (
        <Tag color="volcano" icon={<TagOutlined />} className="text-xs font-bold px-2.5 py-0.5 rounded-md">
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
        <Space className="whitespace-nowrap">
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
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.minOrderValue - b.minOrderValue,
      render: (val: number) => <Text className="whitespace-nowrap">{formatCurrency(val)}</Text>,
    },
    {
      title: 'Hạn Sử Dụng',
      key: 'validity',
      width: 220,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.validFrom.localeCompare(b.validFrom),
      render: (record: VoucherRecord) => (
        <Text type="secondary" className="text-xs whitespace-nowrap">
          <ClockCircleOutlined className="mr-1.5" />
          {formatDate(record.validFrom)} ➔ {formatDate(record.validTo)}
        </Text>
      ),
    },
    {
      title: 'Lượt Sử Dụng',
      key: 'usage',
      width: 160,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.usedCount - b.usedCount,
      render: (record: VoucherRecord) => (
        <Text className="whitespace-nowrap">
          <Text strong>{record.usedCount}</Text> / {record.totalLimit} lượt
        </Text>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 150,
      sorter: (a: VoucherRecord, b: VoucherRecord) => Number(a.isActive) - Number(b.isActive),
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
    <PageContainer>
      <PageHeader
        icon="🎟️"
        title="Quản Lý Mã Giảm Giá & Khuyến Mãi"
        subtitle="Tạo mới, thiết lập hạn mức và theo dõi hiệu quả các chương trình Voucher toàn sàn"
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 font-semibold"
          >
            Tạo Mã Voucher Mới
          </Button>
        }
      />

      {/* Search & Filter Toolbar */}
      <SearchFilterBox
        searchPlaceholder="Tìm theo mã voucher (vd: TRANGIA50K)..."
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel="Lọc trạng thái:"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'ALL', label: 'Tất cả trạng thái' },
          { value: 'ACTIVE', label: 'Đang diễn ra' },
          { value: 'INACTIVE', label: 'Tạm dừng' },
        ]}
      />

      {/* Voucher Table */}
      <Card variant="borderless" className="rounded-xl shadow-xs">
        <DataTable<VoucherRecord>
          rowKey="key"
          columns={columns}
          dataSource={filteredVouchers}
          loading={loading}
          scroll={{ x: 1130 }}
          emptyDescription="Chưa có mã giảm giá"
        />
      </Card>

      {/* Modal Form: Create Voucher */}
      <Modal
        title="✨ Tạo Mã Giảm Giá Mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo Voucher"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-orange-500 font-semibold' }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateVoucher} initialValues={{ discountType: 'fixed', type: 'Platform' }}>
          <Form.Item name="code" label="Mã Voucher (Code)" rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}>
            <Input placeholder="VD: TRANGIA50K" className="uppercase" />
          </Form.Item>

          <Space size="middle" className="flex">
            <Form.Item name="discountType" label="Loại Khuyến Mãi" rules={[{ required: true }]}>
              <Select className="w-44">
                <Option value="fixed">Giảm tiền cố định (đ)</Option>
                <Option value="percent">Giảm theo phần trăm (%)</Option>
              </Select>
            </Form.Item>

            <Form.Item name="discountValue" label="Giá Trị Giảm" rules={[{ required: true, message: 'Nhập giá trị' }]}>
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

          <Form.Item name="validDates" label="Thời Gian Hiệu Lực" rules={[{ required: true, message: 'Chọn khoảng thời gian' }]}>
            <RangePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
