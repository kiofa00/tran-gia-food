import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';

import { RedisService } from '../../redis/redis.service';
import { CmsService } from './cms.service';

// ---------------------------------------------------------------------------
// Axios mock
// ---------------------------------------------------------------------------

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

const makeBannerItem = (id: number, title: string) => ({
  id,
  attributes: {
    title,
    imageUrl: `https://cdn.test/banner_${id}.jpg`,
    targetUrl: '/promo',
    isActive: true,
  },
});

const makeTranslationItem = (id: number, key: string) => ({
  id,
  attributes: {
    key,
    vi: `Giá trị ${id}`,
    en: `Value ${id}`,
    appTarget: 'ALL',
    category: 'GENERAL',
  },
});

const makeFaqItem = (id: number, question: string) => ({
  id,
  attributes: { question, answer: `Trả lời số ${id}`, category: 'ORDER', targetApp: 'customer' },
});

const makeAnnouncementItem = (id: number, title: string) => ({
  id,
  title,
  summary: `Tóm tắt ${id}`,
  content: `Nội dung thông báo ${id}`,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('CmsService', () => {
  let service: CmsService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'CMS_URL') return 'http://localhost:1337';
      return null;
    }),
  };

  const mockRedisService = {
    get: jest.fn().mockResolvedValue(null), // no cache by default
    set: jest.fn().mockResolvedValue('OK'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<CmsService>(CmsService);
    jest.clearAllMocks();
    // Reset Redis cache miss by default
    mockRedisService.get.mockResolvedValue(null);
  });

  // ─── getBanners ───────────────────────────────────────────────────────────

  describe('getBanners', () => {
    it('should fetch banners from Strapi and map to CmsBanner shape', async () => {
      const raw = [makeBannerItem(1, 'Khuyến mãi tháng 8'), makeBannerItem(2, 'Ưu đãi mới')];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: raw } });

      const result = await service.getBanners();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe('Khuyến mãi tháng 8');
      expect(result[0].imageUrl).toBe('https://cdn.test/banner_1.jpg');
      expect(result[0].isActive).toBe(true);
    });

    it('should return cached banners from Redis without hitting Strapi', async () => {
      const cached = [{ id: 99, title: 'Cached banner', imageUrl: '', isActive: true }];
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cached));

      const result = await service.getBanners();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(99);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return empty array when Strapi is offline', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const result = await service.getBanners();

      expect(result).toEqual([]);
    });

    it('should cache fetched banners in Redis with 300s TTL', async () => {
      const raw = [makeBannerItem(3, 'Flash Sale')];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: raw } });

      await service.getBanners();

      expect(mockRedisService.set).toHaveBeenCalledWith('cms:banners', expect.any(String), 300);
    });

    it('should handle empty data array from Strapi gracefully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await service.getBanners();

      expect(result).toEqual([]);
    });

    it('should still return data when Redis set fails', async () => {
      const raw = [makeBannerItem(1, 'Test')];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: raw } });
      mockRedisService.set.mockRejectedValueOnce(new Error('Redis down'));

      const result = await service.getBanners();

      expect(result).toHaveLength(1);
    });
  });

  // ─── getTranslations ──────────────────────────────────────────────────────

  describe('getTranslations', () => {
    it('should fetch and map translation items', async () => {
      const raw = [makeTranslationItem(1, 'app.title'), makeTranslationItem(2, 'nav.home')];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: raw } });

      const result = await service.getTranslations();

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('app.title');
      expect(result[0].appTarget).toBe('ALL');
      expect(result[0].category).toBe('GENERAL');
    });

    it('should return cached translations without Strapi call', async () => {
      const cached = [{ id: 'cached_t', key: 'cached.key', appTarget: 'ALL', category: 'GENERAL' }];
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cached));

      const result = await service.getTranslations();

      expect(result[0].key).toBe('cached.key');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return [] when Strapi is unreachable', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('timeout'));

      const result = await service.getTranslations();

      expect(result).toEqual([]);
    });

    it('should cache translations with 300s TTL', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { data: [makeTranslationItem(1, 'k')] } });

      await service.getTranslations();

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'cms:translations',
        expect.any(String),
        300,
      );
    });
  });

  // ─── getAnnouncements ─────────────────────────────────────────────────────

  describe('getAnnouncements', () => {
    it('should fetch and map announcement items', async () => {
      const raw = [
        makeAnnouncementItem(1, 'Bảo trì hệ thống'),
        makeAnnouncementItem(2, 'Tính năng mới'),
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: raw } });

      const result = await service.getAnnouncements();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Bảo trì hệ thống');
      expect(result[0].summary).toBe('Tóm tắt 1');
    });

    it('should return [] when Strapi throws', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('CMS down'));

      const result = await service.getAnnouncements();

      expect(result).toEqual([]);
    });
  });

  // ─── getFaqs ──────────────────────────────────────────────────────────────

  describe('getFaqs', () => {
    it('should fetch and map FAQ items with correct shape', async () => {
      const raw = [makeFaqItem(1, 'Làm sao đặt hàng?'), makeFaqItem(2, 'Thanh toán thế nào?')];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: raw } });

      const result = await service.getFaqs();

      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('Làm sao đặt hàng?');
      expect(result[0].answer).toBe('Trả lời số 1');
      expect(result[0].category).toBe('ORDER');
      expect(result[0].targetApp).toBe('customer');
    });

    it('should return [] on Strapi error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('404'));

      const result = await service.getFaqs();

      expect(result).toEqual([]);
    });

    it('should fallback gracefully when attributes missing (flat object)', async () => {
      const flat = [
        { id: 10, question: 'Câu hỏi', answer: 'Trả lời', category: 'GENERAL', targetApp: 'ALL' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: flat } });

      const result = await service.getFaqs();

      expect(result[0].question).toBe('Câu hỏi');
    });
  });

  // ─── getCmsStatus ─────────────────────────────────────────────────────────

  describe('getCmsStatus', () => {
    it('should return aggregated status when CMS is online', async () => {
      const banners = [makeBannerItem(1, 'Test')];
      const translations = [makeTranslationItem(1, 'k')];
      const faqs = [makeFaqItem(1, 'Q')];

      // getBanners, getTranslations, getFaqs called in parallel inside getCmsStatus
      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: banners } }) // getBanners
        .mockResolvedValueOnce({ data: { data: translations } }) // getTranslations
        .mockResolvedValueOnce({ data: { data: faqs } }); // getFaqs

      const status = await service.getCmsStatus();

      expect(status.isOnline).toBe(true);
      expect(status.source).toBe('strapi_live');
      expect(status.bannersCount).toBe(1);
      expect(status.translationsCount).toBe(1);
      expect(status.faqsCount).toBe(1);
      expect(status.banners).toHaveLength(1);
    });

    it('should still return isOnline=true when sub-methods catch their own errors and return []', async () => {
      // CmsService sub-methods (getBanners, getTranslations, getFaqs) each catch their own
      // Strapi errors and return [] — they never throw up to getCmsStatus.
      // So getCmsStatus.isOnline is only false when Promise.all itself throws.
      mockedAxios.get.mockRejectedValue(new Error('Strapi offline'));

      const status = await service.getCmsStatus();

      // Sub-methods silently swallow errors → isOnline = true, source = strapi_live, counts = 0
      expect(status.isOnline).toBe(true);
      expect(status.bannersCount).toBe(0);
      expect(status.translationsCount).toBe(0);
      expect(status.faqsCount).toBe(0);
    });

    it('should aggregate counts correctly', async () => {
      const banners = [makeBannerItem(1, 'B1'), makeBannerItem(2, 'B2'), makeBannerItem(3, 'B3')];
      const translations = [makeTranslationItem(1, 'k1'), makeTranslationItem(2, 'k2')];

      // getCmsStatus runs getBanners/getTranslations/getFaqs in parallel via Promise.all.
      // Use URL-based mockImplementation to avoid ordering issues:
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/banners')) return Promise.resolve({ data: { data: banners } });
        if (url.includes('/translations')) return Promise.resolve({ data: { data: translations } });
        if (url.includes('/faq-items')) return Promise.resolve({ data: { data: [] } });
        return Promise.resolve({ data: { data: [] } });
      });

      const status = await service.getCmsStatus();

      expect(status.bannersCount).toBe(3);
      expect(status.translationsCount).toBe(2);
      expect(status.faqsCount).toBe(0);
    });
  });

  // ─── Redis resilience ─────────────────────────────────────────────────────

  describe('Redis resilience', () => {
    it('should still fetch from Strapi when Redis.get throws', async () => {
      mockRedisService.get.mockRejectedValueOnce(new Error('Redis ECONNREFUSED'));
      const raw = [makeBannerItem(1, 'Fallback Banner')];
      mockedAxios.get.mockResolvedValueOnce({ data: { data: raw } });

      const result = await service.getBanners();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Fallback Banner');
    });

    it('should not throw when Redis.set fails after Strapi fetch', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);
      mockRedisService.set.mockRejectedValueOnce(new Error('Redis write fail'));
      mockedAxios.get.mockResolvedValueOnce({ data: { data: [makeBannerItem(1, 'X')] } });

      await expect(service.getBanners()).resolves.toHaveLength(1);
    });
  });
});
