'use client';

import { AimOutlined, CompassOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Badge, Button, Spin, Tag, Typography } from 'antd';

import { useLocale } from '@/hooks';
import { FLEET_STATUS_COLOR_MAP } from '@/shared-config';
import { ShipperRecord } from '@/types';
import { cn } from '@/utils/cn';
import { mapShipperStatus } from '@/utils/formatters';

import { useFleetMap } from '../hooks';

const { Text } = Typography;

interface FleetMapProps {
  activeShippers: ShipperRecord[];
  className?: string;
}

export function FleetMap({ activeShippers, className }: FleetMapProps) {
  const { t } = useLocale();
  const { mapContainerRef, isMapReady, selectedShipper, handleFitBounds, handleResetCenter } =
    useFleetMap({ activeShippers });

  return (
    <div
      className={cn(
        'relative w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-slate-100',
        className,
      )}
    >
      {/* Map Target Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Skeleton */}
      {!isMapReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-xs">
          <Spin size="large" />
          <Text className="mt-3 font-medium text-gray-600">
            {t('fleet.loadingMap', 'Đang tải bản đồ OpenStreetMap...')}
          </Text>
        </div>
      )}

      {/* Top Floating Control Overlay */}
      <div className="absolute top-3 left-3 right-3 z-400 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Status Badge */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg shadow-md border border-gray-200/80 flex items-center gap-2">
          <Badge status="processing" color="#16a34a" />
          <span className="text-xs font-semibold text-gray-800">
            {t('fleet.liveOnlineCount', 'Trực tiếp: {count} tài xế đang Online', {
              count: activeShippers.length,
            })}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md p-1 rounded-lg shadow-md border border-gray-200/80">
          <Button
            size="small"
            type="text"
            icon={<AimOutlined className="text-orange-500" />}
            onClick={handleFitBounds}
            title={t('fleet.fitBoundsTitle', 'Căn chỉnh khung nhìn thấy tất cả tài xế')}
          >
            <span className="text-xs font-medium">{t('fleet.fitBounds', 'Căn chỉnh đội xe')}</span>
          </Button>
          <Button
            size="small"
            type="text"
            icon={<CompassOutlined className="text-blue-500" />}
            onClick={handleResetCenter}
            title={t('fleet.resetCenterTitle', 'Về trung tâm TP. Hồ Chí Minh')}
          >
            <span className="text-xs font-medium">{t('fleet.hcmCity', 'TP.HCM')}</span>
          </Button>
        </div>
      </div>

      {/* Selected Shipper Floating Card (Bottom-Left) */}
      {selectedShipper && (
        <div className="absolute bottom-3 left-3 z-400 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200/90 max-w-xs animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-gray-900 text-sm">🛵 {selectedShipper.name}</span>
            <Tag
              color={
                (FLEET_STATUS_COLOR_MAP as Record<string, string>)[selectedShipper.status] ?? 'blue'
              }
              className="mr-0 text-xs font-semibold"
            >
              {mapShipperStatus(selectedShipper.status).label}
            </Tag>
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            <div className="flex items-center gap-1">
              <span>⭐ {selectedShipper.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-gray-300">•</span>
              <span>📞 {selectedShipper.phone || t('common.notUpdated', 'Chưa cập nhật')}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <EnvironmentOutlined className="text-orange-500" />
              <span>
                {selectedShipper.lat.toFixed(4)}, {selectedShipper.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
