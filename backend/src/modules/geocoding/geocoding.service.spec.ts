import { Test, TestingModule } from '@nestjs/testing';

import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocodingService],
    }).compile();

    service = module.get<GeocodingService>(GeocodingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reverse', () => {
    it('should return parsed address when Nominatim returns data', async () => {
      const mockNominatimResponse = {
        display_name: '63, Đường Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        address: {
          house_number: '63',
          road: 'Đường Lý Tự Trọng',
          suburb: 'Phường Bến Nghé',
          city_district: 'Quận 1',
          city: 'Thành phố Hồ Chí Minh',
        },
      };

      jest
        .spyOn(service as unknown as { httpGetJson: () => Promise<unknown> }, 'httpGetJson')
        .mockResolvedValue(mockNominatimResponse);

      const result = await service.reverse(10.7769, 106.7009);

      expect(result).toBeDefined();
      expect(result.street).toBe('63 Đường Lý Tự Trọng');
      expect(result.ward).toBe('Phường Bến Nghé');
      expect(result.district).toBe('Quận 1');
      expect(result.city).toBe('Thành phố Hồ Chí Minh');
      expect(result.lat).toBe(10.7769);
      expect(result.lng).toBe(106.7009);
    });

    it('should fallback gracefully when http error occurs', async () => {
      jest
        .spyOn(service as unknown as { httpGetJson: () => Promise<unknown> }, 'httpGetJson')
        .mockRejectedValue(new Error('Network error'));

      const result = await service.reverse(10.75, 106.68);

      expect(result).toBeDefined();
      expect(result.fullAddress).toContain('10.75');
      expect(result.lat).toBe(10.75);
      expect(result.lng).toBe(106.68);
    });
  });

  describe('search', () => {
    it('should return empty list for empty query', async () => {
      const result = await service.search('   ');
      expect(result).toEqual([]);
    });

    it('should return list of matching places', async () => {
      const mockItems = [
        {
          name: 'Chợ Bến Thành',
          display_name: 'Chợ Bến Thành, Lê Lợi, Bến Thành, Quận 1, TP.HCM',
          lat: '10.7725',
          lon: '106.6980',
          address: {
            road: 'Lê Lợi',
            suburb: 'Bến Thành',
            district: 'Quận 1',
            city: 'TP.HCM',
          },
        },
      ];

      jest
        .spyOn(service as unknown as { httpGetJson: () => Promise<unknown> }, 'httpGetJson')
        .mockResolvedValue(mockItems);

      const result = await service.search('Chợ Bến Thành');

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Chợ Bến Thành');
      expect(result[0]!.lat).toBe(10.7725);
      expect(result[0]!.lng).toBe(106.698);
    });
  });
});
