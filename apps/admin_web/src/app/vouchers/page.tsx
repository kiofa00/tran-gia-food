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
import { PageContainer, PageHeader } from '../../components';

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
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.minOrderValue - b.minOrderValue,
      render: (val: number) => <Text style={{ whiteSpace: 'nowrap' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Hạn Sử Dụng',
      key: 'validity',
      width: 220,
      sorter: (a: VoucherRecord, b: VoucherRecord) => a.validFrom.localeCompare(b.validFrom),
      render: (record: VoucherRecord) => (
        <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
          <ClockCircleOutlined style={{ marginRight: 6 }} />
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
        <Text style={{ whiteSpace: 'nowrap' }}>
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
            style={{ backgroundColor: adminDesignTokens.colors.primary, fontWeight: 600 }}
          >
            Tạo Mã Voucher Mới
          </Button>
        }
      />

      {/* Filter & Search Toolbar */}
      <Card className="table-filter-card" variant="borderless" style={{ marginBottom: 16, borderRadius: 12 }}>
        <div className="table-filter-toolbar">
          <Input
            placeholder="Tìm theo mã voucher (vd: TRANGIA50K)..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search-input"
          />
          <div className="filter-select-group">
            <Text type="secondary" style={{ whiteSpace: 'nowrap' }}><FilterOutlined /> Lọc trạng thái:</Text>
            <Select defaultValue="ALL" value={statusFilter} onChange={(val) => setStatusFilter(val)} style={{ minWidth: 160 }}>
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="ACTIVE">Đang diễn ra</Option>
              <Option value="INACTIVE">Tạm dừng</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Voucher Table */}
      <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filteredVouchers}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} mục`,
          }}
          scroll={{ x: 1130 }}
          style={{ minHeight: 260 }}
          locale={{ emptyText: loading ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có mã giảm giá" /> }}
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
    </PageContainer>
  );
}
