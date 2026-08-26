'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { FLEET_MAP_CONFIG } from '@/shared-config';
import { ShipperRecord } from '@/types';

import {
  LeafletLayerGroup,
  LeafletMap,
  createShipperCustomIcon,
  createShipperPopupHtml,
  getLeaflet,
  getShipperMarkerColor,
  normalizeShipperCoordinates,
} from '../helpers';

interface UseFleetMapProps {
  activeShippers: ShipperRecord[];
}

export function useFleetMap({ activeShippers }: UseFleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LeafletLayerGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState<ShipperRecord | null>(null);

  // Normalize coordinates with fallback offsets for simulated fleet view
  const shippersWithCoords = useMemo(() => {
    return normalizeShipperCoordinates(activeShippers, FLEET_MAP_CONFIG.defaultCenter);
  }, [activeShippers]);

  // 1. Load Leaflet CSS & JS dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cssId = 'leaflet-css';

    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');

      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = FLEET_MAP_CONFIG.leafletCssUrl;
      link.integrity = FLEET_MAP_CONFIG.leafletCssIntegrity;
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    const jsId = 'leaflet-js';
    const L = getLeaflet();

    if (!L && !document.getElementById(jsId)) {
      const script = document.createElement('script');

      script.id = jsId;
      script.src = FLEET_MAP_CONFIG.leafletJsUrl;
      script.integrity = FLEET_MAP_CONFIG.leafletJsIntegrity;
      script.crossOrigin = '';
      script.onload = () => {
        setIsMapReady(true);
      };
      document.body.appendChild(script);
    } else if (L) {
      setIsMapReady(true);
    }
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    const L = getLeaflet();

    if (!isMapReady || !mapContainerRef.current || !L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: FLEET_MAP_CONFIG.defaultCenter,
        zoom: FLEET_MAP_CONFIG.defaultZoom,
        zoomControl: false,
      });

      L.tileLayer(FLEET_MAP_CONFIG.tileLayerUrl, {
        maxZoom: FLEET_MAP_CONFIG.maxZoom,
        attribution: FLEET_MAP_CONFIG.tileLayerAttribution,
      }).addTo(map);

      L.control
        .zoom({
          position: 'bottomright',
        })
        .addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [isMapReady]);

  // 3. Render / Update Shipper Markers on Map
  useEffect(() => {
    const L = getLeaflet();

    if (!mapInstanceRef.current || !markersLayerRef.current || !L) return;

    const markersLayer = markersLayerRef.current;

    markersLayer.clearLayers();

    if (shippersWithCoords.length === 0) return;

    const bounds = L.latLngBounds([]);

    shippersWithCoords.forEach((shipper) => {
      const colorHex = getShipperMarkerColor(shipper.status);
      const customIcon = createShipperCustomIcon(L, colorHex);
      const marker = L.marker([shipper.lat, shipper.lng], { icon: customIcon });
      const popupHtml = createShipperPopupHtml(shipper, colorHex);

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedShipper(shipper);
      });

      markersLayer.addLayer(marker);
      bounds.extend([shipper.lat, shipper.lng]);
    });
  }, [shippersWithCoords]);

  // Handler: Fit Bounds to all shippers
  const handleFitBounds = () => {
    const L = getLeaflet();

    if (!mapInstanceRef.current || !L || shippersWithCoords.length === 0) return;
    const bounds = L.latLngBounds(shippersWithCoords.map((s) => [s.lat, s.lng]));

    mapInstanceRef.current.fitBounds(bounds, {
      padding: FLEET_MAP_CONFIG.fitBoundsPadding,
      maxZoom: FLEET_MAP_CONFIG.fitBoundsMaxZoom,
    });
  };

  // Handler: Reset to Center
  const handleResetCenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(FLEET_MAP_CONFIG.defaultCenter, FLEET_MAP_CONFIG.defaultZoom);
  };

  return {
    mapContainerRef,
    isMapReady,
    selectedShipper,
    setSelectedShipper,
    shippersWithCoords,
    handleFitBounds,
    handleResetCenter,
  };
}
