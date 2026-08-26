import { describe, expect, it } from 'vitest';

import { FLEET_MAP_CONFIG } from '@/shared-config';
import { ShipperRecord } from '@/types';

import {
  createShipperPopupHtml,
  getShipperMarkerColor,
  mapShipperRecord,
  normalizeShipperCoordinates,
} from './helpers';

describe('Fleet Helpers', () => {
  describe('getShipperMarkerColor', () => {
    it('returns green for ACTIVE and DELIVERING statuses', () => {
      expect(getShipperMarkerColor('ACTIVE')).toBe(FLEET_MAP_CONFIG.markerColors.active);
      expect(getShipperMarkerColor('delivering')).toBe(FLEET_MAP_CONFIG.markerColors.active);
    });

    it('returns orange for BUSY status', () => {
      expect(getShipperMarkerColor('BUSY')).toBe(FLEET_MAP_CONFIG.markerColors.busy);
      expect(getShipperMarkerColor('busy')).toBe(FLEET_MAP_CONFIG.markerColors.busy);
    });

    it('returns default blue for other or unknown statuses', () => {
      expect(getShipperMarkerColor('IDLE')).toBe(FLEET_MAP_CONFIG.markerColors.default);
      expect(getShipperMarkerColor('OFFLINE')).toBe(FLEET_MAP_CONFIG.markerColors.default);
      expect(getShipperMarkerColor(undefined)).toBe(FLEET_MAP_CONFIG.markerColors.default);
    });
  });

  describe('normalizeShipperCoordinates', () => {
    const baseShipper: ShipperRecord = {
      id: '1',
      key: '1',
      name: 'Nguyen Van A',
      phone: '0901234567',
      vehicle: 'MOTORBIKE',
      plate: '59A-12345',
      lat: 10.7769,
      lng: 106.7009,
      status: 'DELIVERING',
      ekycStatus: 'VERIFIED',
      rating: 4.8,
    };

    it('preserves valid coordinates', () => {
      const result = normalizeShipperCoordinates([baseShipper]);
      const shipper = result[0]!;

      expect(shipper.lat).toBe(10.7769);
      expect(shipper.lng).toBe(106.7009);
    });

    it('generates simulated coordinates for zero or NaN coordinates', () => {
      const zeroCoordShipper = { ...baseShipper, lat: 0, lng: 0 };
      const result = normalizeShipperCoordinates([zeroCoordShipper]);
      const shipper = result[0]!;

      expect(shipper.lat).not.toBe(0);
      expect(shipper.lng).not.toBe(0);
      expect(Math.abs(shipper.lat - FLEET_MAP_CONFIG.defaultCenter[0])).toBeLessThan(0.1);
      expect(Math.abs(shipper.lng - FLEET_MAP_CONFIG.defaultCenter[1])).toBeLessThan(0.1);
    });
  });

  describe('createShipperPopupHtml', () => {
    it('generates formatted popup html with shipper data', () => {
      const shipper: ShipperRecord = {
        id: '2',
        key: '2',
        name: 'Tran Van B',
        phone: '0987654321',
        vehicle: 'MOTORBIKE',
        plate: '51F-99999',
        lat: 10.8,
        lng: 106.7,
        status: 'DELIVERING',
        ekycStatus: 'VERIFIED',
        rating: 4.9,
      };

      const html = createShipperPopupHtml(shipper, '#16a34a');

      expect(html).toContain('Tran Van B');
      expect(html).toContain('0987654321');
      expect(html).toContain('51F-99999');
      expect(html).toContain('4.9');
      expect(html).toContain('#16a34a');
    });
  });

  describe('mapShipperRecord', () => {
    it('correctly maps raw backend object to ShipperRecord', () => {
      const raw = {
        id: 10,
        name: 'Le Van C',
        phone: '0912345678',
        lat: '10.75',
        lng: '106.68',
        status: 'IDLE',
      };

      const record = mapShipperRecord(raw, 0);

      expect(record.id).toBe('10');
      expect(record.name).toBe('Le Van C');
      expect(record.lat).toBe(10.75);
      expect(record.lng).toBe(106.68);
      expect(record.status).toBe('IDLE');
      expect(record.rating).toBe(5.0);
    });
  });
});
