'use client';

import { useState } from 'react';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CompassOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Card, Tag, Typography } from 'antd';

import {
  DataTable,
  PageContainer,
  PageHeader,
  PlateBadge,
  SearchFilterBox,
  VehicleBadge,
} from '@/components';
import { useFleetQuery } from '@/hooks/useFleet';
import { ShipperRecord } from '@/types';
import { mapShipperStatus } from '@/utils/formatters';

const { Title, Text } = Typography;

export default function LiveFleetMonitorPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawShippers, isLoading: loading } = useFleetQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const rawList = Array.isArray(rawShippers)
    ? rawShippers
    : (rawShippers as { data?: Record<string, unknown>[] })?.data || [];

  const shippers: ShipperRecord[] = rawList.map((item: Record<string, unknown>, idx: number) => ({
    id: String(item.id || item.key || idx + 1),
    key: String(item.id || item.key || idx + 1),
    name: String(item.name || ''),
    phone: String(item.phone || ''),
    vehicle: String(item.vehicle || 'MOTORBIKE'),
    plate: String(item.plate || ''),
    lat: Number(item.lat) || 0,
    lng: Number(item.lng) || 0,
    status: String(item.status || 'OFFLINE'),
    ekycStatus: String(item.ekycStatus || 'PENDING'),
    rating: Number(item.rating) || 5.0,
  }));

  const filteredShippers = shippers.filter((s) => {
    const matchesSearch =
      !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Mã Shipper',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => (
        <Text strong className="whitespace-nowrap">
          {id}
        </Text>
      ),
    },
    {
      title: 'Tài Xế',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a: ShipperRecord, b: ShipperRecord) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Text strong className="whitespace-nowrap">
          {text}
        </Text>
      ),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (text: string) => <Text className="whitespace-nowrap">{text}</Text>,
    },
    {
      title: 'Phương Tiện',
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 160,
      render: (type: string) => <VehicleBadge vehicle={type} />,
    },
    {
      title: 'Biển Số Xe',
      dataIndex: 'plate',
      key: 'plate',
      width: 160,
      render: (plate: string) => <PlateBadge plate={plate} />,
    },
    {
      title: 'Tọa Độ GPS',
      key: 'gps',
      width: 180,
      render: (_: unknown, record: ShipperRecord) => (
        <Tag icon={<CompassOutlined />} color="purple" className="text-xs px-2.5 py-0.5">
          {record.lat.toFixed(4)}, {record.lng.toFixed(4)}
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 220,
      sorter: (a: ShipperRecord, b: ShipperRecord) => a.status.localeCompare(b.status),
      render: (status: string) => {
        const meta = mapShipperStatus(status);
        let icon = <CloseCircleOutlined />;

        if (meta.tagColor === 'success') {
          icon = <CheckCircleOutlined />;
        } else if (meta.tagColor === 'warning' || meta.tagColor === 'processing') {
          icon = <SyncOutlined spin />;
        }

        return (
          <Tag color={meta.tagColor} icon={icon} className="whitespace-nowrap">
            {meta.label}
          </Tag>
        );
      },
    },
  ];

  const activeShippers = filteredShippers.filter((s) => s.status !== 'OFFLINE');

  return (
    <PageContainer>
      <PageHeader
        icon="🗺️"
        title="Live Fleet Monitor — Bản Đồ Tài Xế Realtime"
        subtitle="Theo dõi vị trí GPS & trạng thái hoạt động của tất cả tài xế trên hệ thống"
      />

      {/* Live Map Card */}
      <Card variant="borderless" className="mb-6 rounded-xl shadow-xs">
        <div className="h-72 bg-gray-100 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-gray-200">
          <CompassOutlined className="text-5xl text-orange-500 mb-3" />
          <Title level={4} className="m-0">
            Google Maps Live Stream Gateway
          </Title>
          <Text type="secondary">
            Đang streaming WebSocket tọa độ GPS của {activeShippers.length} tài xế đang Online
          </Text>

          {/* Shipper Markers */}
          {activeShippers.map((s: ShipperRecord, i: number) => {
            let color = 'blue';

            if (s.status === 'DELIVERING') color = 'orange';
            else if (s.status === 'IDLE') color = 'green';

            return (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  top: `${25 + (i % 3) * 25}%`,
                  left: `${20 + (i % 4) * 20}%`,
                }}
              >
                <Tag color={color} className="px-3 py-1.5 text-xs font-bold rounded-md shadow-xs">
                  🛵 {s.name} ({mapShipperStatus(s.status).label})
                </Tag>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filter & Search Toolbar */}
      <SearchFilterBox
        searchPlaceholder="Tìm theo tên hoặc SĐT tài xế..."
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel="Lọc trạng thái:"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'ALL', label: 'Tất cả trạng thái' },
          { value: 'DELIVERING', label: 'Đang giao hàng' },
          { value: 'IDLE', label: 'Đang sẵn sàng nhận đơn' },
          { value: 'OFFLINE', label: 'Offline' },
        ]}
      />

      {/* Table */}
      <Card
        title={`⚡ Danh Sách Tài Xế Đang Online (${filteredShippers.length})`}
        variant="borderless"
        className="rounded-xl shadow-xs"
      >
        <DataTable<ShipperRecord>
          rowKey="key"
          columns={columns}
          dataSource={filteredShippers}
          loading={loading}
          scroll={{ x: 1060 }}
          emptyDescription="Chưa có tài xế trực tuyến"
        />
      </Card>
    </PageContainer>
  );
}
