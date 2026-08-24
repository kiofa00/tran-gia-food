import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { RedisService } from '../../redis/redis.service';
import {
  CmsAnnouncement,
  CmsBanner,
  CmsFaq,
  CmsStatusResponse,
  CmsTranslation,
} from './types/cms.types';

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);
  private readonly cmsUrl: string;

  constructor(
    private config: ConfigService,
    private redis: RedisService,
  ) {
    this.cmsUrl = this.config.get<string>('CMS_URL') || 'http://localhost:1337';
  }

  async getBanners(bypassCache = false): Promise<CmsBanner[]> {
    const cacheKey = 'cms:banners';
    if (!bypassCache) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch {
        /* Redis cache miss or connection error */
      }
    }

    try {
      const res = await axios.get(
        `${this.cmsUrl}/api/banners?pagination[pageSize]=1000&populate=*`,
        {
          timeout: 3000,
        },
      );
      const banners: CmsBanner[] = (res.data?.data || []).map((item: Record<string, unknown>) => ({
        id: (item.id as string | number) || `b_${Date.now()}`,
        title:
          ((item.attributes
            ? (item.attributes as Record<string, unknown>).title
            : item.title) as string) || 'Banner',
        imageUrl:
          ((item.attributes
            ? (item.attributes as Record<string, unknown>).imageUrl
            : item.imageUrl) as string) || '',
        linkUrl:
          ((item.attributes
            ? (item.attributes as Record<string, unknown>).targetUrl
            : item.linkUrl) as string) || '',
        isActive:
          (item.attributes
            ? (item.attributes as Record<string, unknown>).isActive
            : item.isActive) !== false,
      }));

      if (banners.length > 0) {
        try {
          await this.redis.set(cacheKey, JSON.stringify(banners), 300);
        } catch {
          /* Redis cache error */
        }
      }

      return banners;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Strapi CMS banners unreachable at ${this.cmsUrl}: ${msg}`);
      return [];
    }
  }

  async getTranslations(bypassCache = false): Promise<CmsTranslation[]> {
    const cacheKey = 'cms:translations';
    if (!bypassCache) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch {
        /* Redis cache miss or connection error */
      }
    }

    try {
      const res = await axios.get(
        `${this.cmsUrl}/api/translations?pagination[pageSize]=1000&populate=*`,
        { timeout: 3000 },
      );
      const translations: CmsTranslation[] = (res.data?.data || []).map(
        (item: Record<string, unknown>) => {
          const rawAttrs = (item.attributes as Record<string, unknown>) || item;
          return {
            ...rawAttrs,
            id: (item.id as string | number) || `t_${Date.now()}`,
            key: String(rawAttrs.key || ''),
            appTarget: String(rawAttrs.appTarget || rawAttrs.targetApp || 'ALL'),
            category: String(rawAttrs.category || 'GENERAL'),
          };
        },
      );

      if (translations.length > 0) {
        try {
          await this.redis.set(cacheKey, JSON.stringify(translations), 300);
        } catch {
          /* Redis cache error */
        }
      }

      return translations;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Strapi CMS translations unreachable at ${this.cmsUrl}: ${msg}`);
      return [];
    }
  }

  async getAnnouncements(): Promise<CmsAnnouncement[]> {
    try {
      const res = await axios.get(`${this.cmsUrl}/api/announcements?pagination[pageSize]=1000`, {
        timeout: 3000,
      });
      return (res.data?.data || []).map((item: Record<string, unknown>) => ({
        id: (item.id as string | number) || `a_${Date.now()}`,
        title: String(item.title || ''),
        summary: String(item.summary || ''),
        content: String(item.content || ''),
      }));
    } catch {
      return [];
    }
  }

  async getFaqs(bypassCache = false): Promise<CmsFaq[]> {
    const cacheKey = 'cms:faqs';
    if (!bypassCache) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch {
        /* Redis cache miss */
      }
    }

    try {
      const res = await axios.get(
        `${this.cmsUrl}/api/faq-items?pagination[pageSize]=1000&populate=*`,
        {
          timeout: 3000,
        },
      );
      const faqs = (res.data?.data || []).map((item: Record<string, unknown>) => {
        const attrs = (item.attributes as Record<string, unknown>) || item;
        return {
          id: (item.id as string | number) || `f_${Date.now()}`,
          question: String(attrs.question || ''),
          answer: String(attrs.answer || ''),
          category: String(attrs.category || 'GENERAL'),
          targetApp: String(attrs.targetApp || attrs.appTarget || 'ALL'),
        };
      });

      if (faqs.length > 0) {
        try {
          await this.redis.set(cacheKey, JSON.stringify(faqs), 300);
        } catch {
          /* Redis cache error */
        }
      }

      return faqs;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Strapi CMS FAQs unreachable at ${this.cmsUrl}: ${msg}`);
      return [];
    }
  }

  async getCmsStatus(): Promise<CmsStatusResponse> {
    try {
      const [banners, translations, faqs] = await Promise.all([
        this.getBanners(true),
        this.getTranslations(true),
        this.getFaqs(true),
      ]);

      return {
        isOnline: true,
        source: 'strapi_live',
        bannersCount: banners.length,
        translationsCount: translations.length,
        faqsCount: faqs.length,
        banners,
        translations,
        faqs,
      };
    } catch {
      return {
        isOnline: false,
        source: 'empty',
        bannersCount: 0,
        translationsCount: 0,
        faqsCount: 0,
        banners: [],
        translations: [],
        faqs: [],
      };
    }
  }
}
