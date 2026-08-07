'use client';

import { CompassOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';

import { FLEET_STATUS_COLOR_MAP } from '@/shared-config';
import { ShipperRecord } from '@/types';
import { cn } from '@/utils/cn';
import { mapShipperStatus } from '@/utils/formatters';

const { Title, Text } = Typography;

interface FleetMapProps {
  activeShippers: ShipperRecord[];
  className?: string;
}

export function FleetMap({ activeShippers, className }: FleetMapProps) {
  return (
    <div
      className={cn(
        'h-72 bg-gray-100 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-gray-200',
        className,
      )}
    >
      <CompassOutlined className="text-5xl text-orange-500 mb-3" />
      <Title level={4} className="m-0">
        Google Maps Live Stream Gateway
      </Title>
      <Text type="secondary">
        Đang streaming WebSocket tọa độ GPS của {activeShippers.length} tài xế đang Online
      </Text>

      {activeShippers.map((s: ShipperRecord, i: number) => {
        const color = FLEET_STATUS_COLOR_MAP[s.status] ?? 'blue';

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
  );
}
