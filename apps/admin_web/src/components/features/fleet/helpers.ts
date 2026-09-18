import { FLEET_MAP_CONFIG } from '@/shared-config';
import { ShipperRecord } from '@/types';
import { mapShipperStatus } from '@/utils/formatters';

export interface LeafletMap {
  setView: (center: [number, number], zoom: number) => void;
  fitBounds: (bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number }) => void;
  invalidateSize: () => void;
  remove: () => void;
}

export interface LeafletLayerGroup {
  clearLayers: () => void;
  addLayer: (layer: unknown) => void;
}

export interface LeafletNamespace {
  map: (element: HTMLElement, options: Record<string, unknown>) => LeafletMap;
  tileLayer: (
    url: string,
    options: Record<string, unknown>,
  ) => { addTo: (map: LeafletMap) => void };
  layerGroup: () => LeafletLayerGroup & { addTo: (map: LeafletMap) => LeafletLayerGroup };
  control: {
    zoom: (options: { position: string }) => { addTo: (map: LeafletMap) => void };
  };
  divIcon: (options: Record<string, unknown>) => unknown;
  marker: (
    latLng: [number, number],
    options: { icon: unknown },
  ) => {
    bindPopup: (html: string) => void;
    on: (event: string, handler: () => void) => void;
  };
  latLngBounds: (points: [number, number][]) => {
    extend: (latLng: [number, number]) => void;
  };
}

/** Get Leaflet global instance if available in browser window */
export function getLeaflet(): LeafletNamespace | undefined {
  if (typeof window === 'undefined') return undefined;

  return (window as unknown as { L?: LeafletNamespace }).L;
}

/** Get hex color representation for shipper status */
export function getShipperMarkerColor(status?: string): string {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'DELIVERING':
      return FLEET_MAP_CONFIG.markerColors.active;
    case 'BUSY':
      return FLEET_MAP_CONFIG.markerColors.busy;
    default:
      return FLEET_MAP_CONFIG.markerColors.default;
  }
}

export interface NormalizedShipper extends ShipperRecord {
  lat: number;
  lng: number;
}

/** Normalize shipper GPS coordinates, generating deterministic simulation spread for zero/invalid coordinates */
export function normalizeShipperCoordinates(
  activeShippers: ShipperRecord[],
  defaultCenter: [number, number] = FLEET_MAP_CONFIG.defaultCenter,
): NormalizedShipper[] {
  return activeShippers.map((s, idx) => {
    let lat = Number(s.lat);
    let lng = Number(s.lng);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      // Deterministic offset around center for simulation
      const count = Math.max(1, activeShippers.length);
      const angle = (idx * (360 / count) * Math.PI) / 180;
      const radius = 0.015 + (idx % 3) * 0.008; // ~1.5 - 3km

      lat = defaultCenter[0] + radius * Math.cos(angle);
      lng = defaultCenter[1] + radius * Math.sin(angle);
    }

    return { ...s, lat, lng };
  });
}

/** Generate HTML content for shipper popup on map */
export function createShipperPopupHtml(
  shipper: ShipperRecord,
  colorHex: string,
  defaultPlate = 'MOTORBIKE',
): string {
  const statusMeta = mapShipperStatus(shipper.status);
  const ratingText = shipper.rating ? shipper.rating.toFixed(1) : '5.0';
  const phoneText = shipper.phone || 'N/A';
  const plateText = shipper.plate || defaultPlate;

  return `
    <div class="font-sans text-[13px] min-w-45 p-0.5">
      <div class="font-bold text-sm text-gray-900 mb-1 flex items-center justify-between">
        <span>${shipper.name}</span>
        <span class="text-amber-500 text-xs">★ ${ratingText}</span>
      </div>
      <div class="text-gray-600 mb-0.5">📞 ${phoneText}</div>
      <div class="text-gray-600 mb-1.5">🛵 ${plateText}</div>
      <div class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border" style="background: ${colorHex}20; color: ${colorHex}; border-color: ${colorHex}40;">
        ${statusMeta.label}
      </div>
    </div>
  `;
}

/** Create custom Leaflet divIcon for shipper marker */
export function createShipperCustomIcon(L: LeafletNamespace, colorHex: string): unknown {
  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
        <div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: ${colorHex}33; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 30px; height: 30px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; background: ${colorHex}; position: relative; z-index: 1;">
          🛵
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

/** Map raw API item to typed ShipperRecord */
export function mapShipperRecord(item: Record<string, unknown>, idx: number): ShipperRecord {
  return {
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
  };
}
