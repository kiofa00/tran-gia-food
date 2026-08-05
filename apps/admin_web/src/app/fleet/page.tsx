'use client';

import React from 'react';
import { Card, Table, Tag, Typography, Badge } from 'antd';
import { CompassOutlined, CarOutlined } from '@ant-design/icons';
import { adminDesignTokens } from '../../theme/tokens';
import { mapShipperStatus } from '../../utils/formatters';

const { Title, Text } = Typography;

export default function LiveFleetMonitorPage() {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{id}</Text>,
    },
    {
      title: 'Họ & Tên',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <Text strong style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (text: string) => <Text style={{ whiteSpace: 'nowrap' }}>{text}</Text>,
    },
    {
      title: 'Phương Tiện',
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 220,
      render: (vehicle: string) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          <CarOutlined style={{ marginRight: 6, color: adminDesignTokens.colors.primary }} />
          {vehicle}
        </span>
      ),
    },
    {
      title: 'Tọa Độ GPS',
      key: 'gps',
      width: 200,
      render: (record: { lat: number; lng: number }) => (
        <Tag icon={<CompassOutlined />} color="purple" style={{ fontSize: 13, padding: '2px 10px' }}>
          ({record.lat.toFixed(4)}, {record.lng.toFixed(4)})
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 220,
      render: (status: string) => {
        const meta = mapShipperStatus(status);
        return <Badge status={meta.badgeStatus} text={<Text strong style={{ whiteSpace: 'nowrap' }}>{meta.label}</Text>} />;
      },
    },
  ];

  const dataSource = [
    { key: '1', id: 'S1', name: 'Nguyễn Văn Cường', phone: '0912 345 678', vehicle: 'Honda Wave (59P1-999.88)', lat: 10.7626, lng: 106.6822, status: 'DELIVERING' },
    { key: '2', id: 'S2', name: 'Lê Hoàng Nam', phone: '0987 654 321', vehicle: 'Yamaha Exciter (59X2-123.45)', lat: 10.7550, lng: 106.6800, status: 'IDLE' },
    { key: '3', id: 'S3', name: 'Phan Thanh Bình', phone: '0903 111 222', vehicle: 'Honda Winner (59Z1-888.99)', lat: 10.7700, lng: 106.6900, status: 'PICKING_UP' },
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
      <Card bordered={false} style={{ marginBottom: 24 }}>
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
          <Text type="secondary">Đang streaming WebSocket tọa độ GPS của 3 tài xế đang Online</Text>

          {/* Shipper Markers */}
          <div style={{ position: 'absolute', top: '30%', left: '25%' }}>
            <Tag color="orange" style={{ padding: '6px 12px', fontSize: 13, fontWeight: 'bold' }}>
              🛵 Nguyễn Văn Cường (#12345)
            </Tag>
          </div>
          <div style={{ position: 'absolute', top: '60%', left: '65%' }}>
            <Tag color="green" style={{ padding: '6px 12px', fontSize: 13, fontWeight: 'bold' }}>
              🛵 Lê Hoàng Nam (Sẵn sàng)
            </Tag>
          </div>
        </div>
      </Card>

      {/* Antd Table */}
      <Card title={`⚡ Danh Sách Tài Xế Đang Online (${dataSource.length})`} bordered={false}>
        <Table columns={columns} dataSource={dataSource} pagination={false} scroll={{ x: 1060 }} />
      </Card>
    </div>
  );
}
