'use client';

import React, { useState } from 'react';
import { Card, Table, Tag, Typography, Badge, Empty, Input, Select, Space } from 'antd';
import { CompassOutlined, CarOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';
import { mapShipperStatus, mapVehicleType } from '../../utils/formatters';
import { VehicleBadge, PlateBadge } from '../../components';
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
    <div style={{ padding: adminDesignTokens.padding.lg }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: adminDesignTokens.colors.primary, margin: 0 }}>
          🗺️ Live Fleet Monitor — Bản Đồ Tài Xế Realtime
        </Title>
        <Text type="secondary">Theo dõi vị trí GPS & trạng thái hoạt động của tất cả tài xế trên hệ thống</Text>
      </div>

      {/* Antd Live Map Card */}
      <Card variant="borderless" style={{ marginBottom: 24 }}>
        <div
          style={{
            height: '300px',
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #d9d9d9',
          }}
        >
          <CompassOutlined style={{ fontSize: 54, color: adminDesignTokens.colors.primary, marginBottom: 12 }} />
          <Title level={4} style={{ margin: 0 }}>Google Maps Live Stream Gateway</Title>
          <Text type="secondary">Đang streaming WebSocket tọa độ GPS của {shippers.length} tài xế đang Online</Text>

          {/* Shipper Markers */}
          {shippers.map((s: any, i: number) => (
            <div key={s.id} style={{ position: 'absolute', top: `${30 + i * 25}%`, left: `${25 + i * 20}%` }}>
              <Tag color={s.status === 'DELIVERING' ? 'orange' : s.status === 'IDLE' ? 'green' : 'blue'} style={{ padding: '6px 12px', fontSize: 13, fontWeight: 'bold' }}>
                🛵 {s.name} ({mapShipperStatus(s.status).label})
              </Tag>
            </div>
          ))}
        </div>
      </Card>

      {/* Filter & Search Toolbar */}
      <Card className="table-filter-card" variant="borderless" style={{ marginBottom: 16, borderRadius: 12 }}>
        <div className="table-filter-toolbar">
          <Input
            placeholder="Tìm theo tên hoặc SĐT tài xế..."
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
              <Option value="DELIVERING">Đang giao hàng</Option>
              <Option value="IDLE">Đang sẵn sàng nhận đơn</Option>
              <Option value="OFFLINE">Offline</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Antd Table */}
      <Card title={`⚡ Danh Sách Tài Xế Đang Online (${filteredShippers.length})`} variant="borderless">
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filteredShippers}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} mục`,
          }}
          scroll={{ x: 1060 }}
          style={{ minHeight: 260 }}
          locale={{ emptyText: loading ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tài xế trực tuyến" /> }}
        />
      </Card>
    </div>
  );
}

