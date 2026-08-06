'use client';

import React, { useState } from 'react';
import { Card, Table, Tag, Typography, Badge, Empty, Input, Select, Space } from 'antd';
import { CompassOutlined, CarOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';
import { mapShipperStatus, mapVehicleType } from '../../utils/formatters';
import { VehicleBadge, PlateBadge, PageContainer, PageHeader, SearchFilterBox, DataTable } from '../../components';
import { useFleetQuery } from '../../hooks/useFleet';

import { ShipperRecord } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

export default function LiveFleetMonitorPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: rawShippers, isLoading: loading } = useFleetQuery({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const rawList = Array.isArray(rawShippers) ? rawShippers : (rawShippers?.data || []);
  const shippers: ShipperRecord[] = rawList.map((item: Record<string, unknown>, idx: number) => ({
    key: String(item.id || item.key || idx + 1),
    id: String(item.id || `S${idx + 1}`),
    name: String(item.name || ''),
    phone: String(item.phone || ''),
    vehicle: mapVehicleType(String(item.vehicle || item.vehicleType || '')),
    plate: String(item.plate || item.licensePlate || ''),
    lat: Number(item.lat) || 0,
    lng: Number(item.lng) || 0,
    status: String(item.status || 'OFFLINE'),
  }));

  const filteredShippers = shippers.filter((item: ShipperRecord) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: ShipperRecord, b: ShipperRecord) => a.id.localeCompare(b.id),
      render: (id: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{id}</Text>,
    },
    {
      title: 'Họ & Tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a: ShipperRecord, b: ShipperRecord) => a.name.localeCompare(b.name),
      render: (text: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => <Text style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Phương Tiện',
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 180,
      sorter: (a: ShipperRecord, b: ShipperRecord) => (a.vehicle || '').localeCompare(b.vehicle || ''),
      render: (vehicle: string) => <VehicleBadge vehicle={vehicle} />,
    },
    {
      title: 'Biển Số Xe',
      dataIndex: 'plate',
      key: 'plate',
      width: 140,
      render: (plate?: string) => <PlateBadge plate={plate} />,
    },
    {
      title: 'Tọa Độ GPS',
      key: 'gps',
      width: 200,
      render: (record: { lat: number; lng: number }) => (
        <Tag icon={<CompassOutlined />} color="purple" style={{ fontSize: 13, padding: '2px 10px' }}>
          ({record.lat?.toFixed(4)}, {record.lng?.toFixed(4)})
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
        const icon =
          meta.tagColor === 'success' ? (
            <CheckCircleOutlined />
          ) : meta.tagColor === 'warning' || meta.tagColor === 'processing' ? (
            <SyncOutlined spin />
          ) : (
            <CloseCircleOutlined />
          );
        return (
          <Tag color={meta.tagColor} icon={icon} style={{ whiteSpace: 'nowrap' }}>
            {meta.label}
          </Tag>
        );
      },
    },
  ];

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
          <Title level={4} className="m-0">Google Maps Live Stream Gateway</Title>
          <Text type="secondary">Đang streaming WebSocket tọa độ GPS của {shippers.length} tài xế đang Online</Text>

          {/* Shipper Markers */}
          {shippers.map((s: ShipperRecord, i: number) => (
            <div key={s.id} style={{ position: 'absolute', top: `${30 + i * 25}%`, left: `${25 + i * 20}%` }}>
              <Tag color={s.status === 'DELIVERING' ? 'orange' : s.status === 'IDLE' ? 'green' : 'blue'} className="px-3 py-1.5 text-xs font-bold rounded-md">
                🛵 {s.name} ({mapShipperStatus(s.status).label})
              </Tag>
            </div>
          ))}
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
      <Card title={`⚡ Danh Sách Tài Xế Đang Online (${filteredShippers.length})`} variant="borderless" className="rounded-xl shadow-xs">
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

