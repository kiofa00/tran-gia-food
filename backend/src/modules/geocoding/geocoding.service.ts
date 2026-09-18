import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

export interface GeocodingResult {
  fullAddress: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  displayName: string;
}

export interface GeocodingSearchResult {
  name: string;
  displayName: string;
  fullAddress: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly cache = new Map<string, { data: unknown; expiresAt: number }>();
  private readonly cacheTtlMs = 60 * 60 * 1000; // 1 hour

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(key: string, data: unknown): void {
    if (this.cache.size > 2000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiresAt: Date.now() + this.cacheTtlMs });
  }

  private httpGetJson<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: 'nominatim.openstreetmap.org',
        path,
        headers: {
          'User-Agent': 'TranGiaFoodApp/1.0 (contact@trangiafood.vn)',
          Accept: 'application/json',
        },
      };

      https
        .get(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              if (res.statusCode && res.statusCode >= 400) {
                return reject(new Error(`Nominatim error status: ${res.statusCode}`));
              }
              const json = JSON.parse(data);
              resolve(json as T);
            } catch (err) {
              reject(err);
            }
          });
        })
        .on('error', (err) => reject(err));
    });
  }

  /**
   * Reverse Geocoding: Tọa độ lat, lng -> Thông tin địa chỉ Việt Nam
   */
  async reverse(lat: number, lng: number): Promise<GeocodingResult> {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));
    const cacheKey = `rev_${roundedLat}_${roundedLng}`;

    const cached = this.getCached<GeocodingResult>(cacheKey);
    if (cached) return cached;

    try {
      const path = `/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&zoom=18&addressdetails=1`;
      const data = await this.httpGetJson<Record<string, unknown>>(path);

      const parsed = this.parseNominatimAddress(data, roundedLat, roundedLng);
      this.setCached(cacheKey, parsed);
      return parsed;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Reverse geocoding failed for ${lat},${lng}: ${errorMsg}`);
      // Fallback response with coordinates
      return {
        fullAddress: `Vị trí (${roundedLat}, ${roundedLng})`,
        street: '',
        ward: '',
        district: '',
        city: 'TP. Hồ Chí Minh',
        lat: roundedLat,
        lng: roundedLng,
        displayName: `Tọa độ: ${roundedLat}, ${roundedLng}`,
      };
    }
  }

  /**
   * Search Geocoding: Tên địa điểm/đường -> Danh sách kết quả tại Việt Nam
   */
  async search(query: string): Promise<GeocodingSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const cacheKey = `search_${trimmed.toLowerCase()}`;
    const cached = this.getCached<GeocodingSearchResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const path = `/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=vn&addressdetails=1&limit=10`;
      const items = await this.httpGetJson<Record<string, unknown>[]>(path);

      const results: GeocodingSearchResult[] = (items || []).map((item) => {
        const itemLat = parseFloat(String(item.lat));
        const itemLng = parseFloat(String(item.lon));
        const parsed = this.parseNominatimAddress(item, itemLat, itemLng);
        const rawName = typeof item.name === 'string' ? item.name : '';
        const rawDisplayName = typeof item.display_name === 'string' ? item.display_name : '';
        const name = rawName || parsed.street || rawDisplayName.split(',')[0] || 'Địa điểm';

        return {
          name,
          displayName: rawDisplayName || parsed.fullAddress,
          fullAddress: parsed.fullAddress,
          street: parsed.street,
          ward: parsed.ward,
          district: parsed.district,
          city: parsed.city,
          lat: itemLat,
          lng: itemLng,
        };
      });

      this.setCached(cacheKey, results);
      return results;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Geocoding search failed for '${query}': ${errorMsg}`);
      return [];
    }
  }

  private parseNominatimAddress(
    raw: Record<string, unknown>,
    lat: number,
    lng: number,
  ): GeocodingResult {
    const addr = (raw.address as Record<string, string>) || {};

    const houseNumber = addr.house_number ? `${addr.house_number} ` : '';
    const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
    const street = (houseNumber + road).trim() || addr.amenity || addr.shop || '';

    const ward =
      addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.commune || '';

    const district = addr.city_district || addr.district || addr.county || addr.town || '';

    const city = addr.city || addr.province || addr.state || 'TP. Hồ Chí Minh';

    // Xây dựng chuỗi địa chỉ đầy đủ
    const parts = [street, ward, district, city].filter((p) => p && p.trim().length > 0);
    const rawDisplayName = typeof raw.display_name === 'string' ? raw.display_name : '';
    const fullAddress =
      parts.length > 0 ? parts.join(', ') : rawDisplayName || `Vị trí (${lat}, ${lng})`;

    return {
      fullAddress,
      street,
      ward,
      district,
      city,
      lat,
      lng,
      displayName: rawDisplayName || fullAddress,
    };
  }
}
