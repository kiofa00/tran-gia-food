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

  async getBanners(): Promise<CmsBanner[]> {
    const cacheKey = 'cms:banners';
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      /* Redis cache miss or connection error */
    }

    try {
      const res = await axios.get(`${this.cmsUrl}/api/banners`, { timeout: 3000 });
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

      try {
        await this.redis.set(cacheKey, JSON.stringify(banners), 300);
      } catch {
        /* Redis cache miss or connection error */
      }

      return banners;
    } catch {
      this.logger.warn(`Strapi CMS offline at ${this.cmsUrl}. Returning empty banner list.`);
      return [];
    }
  }

  async getTranslations(): Promise<CmsTranslation[]> {
    const cacheKey = 'cms:translations';
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      /* Redis cache miss or connection error */
    }

    try {
      const res = await axios.get(`${this.cmsUrl}/api/translations`, { timeout: 3000 });
      const translations: CmsTranslation[] = (res.data?.data || []).map(
        (item: Record<string, unknown>) => ({
          id: (item.id as string | number) || `t_${Date.now()}`,
          key:
            ((item.attributes
              ? (item.attributes as Record<string, unknown>).key
              : item.key) as string) || '',
          vi:
            ((item.attributes
              ? (item.attributes as Record<string, unknown>).vi
              : item.vi) as string) || '',
          en:
            ((item.attributes
              ? (item.attributes as Record<string, unknown>).en
              : item.en) as string) || '',
          appTarget:
            ((item.attributes
              ? (item.attributes as Record<string, unknown>).appTarget
              : item.appTarget) as string) || 'ALL',
          category:
            ((item.attributes
              ? (item.attributes as Record<string, unknown>).category
              : item.category) as string) || 'GENERAL',
        }),
      );

      try {
        await this.redis.set(cacheKey, JSON.stringify(translations), 300);
      } catch {
        /* Redis cache miss or connection error */
      }

      return translations;
    } catch {
      this.logger.warn(`Strapi CMS offline at ${this.cmsUrl}. Returning empty translation list.`);
      return [];
    }
  }

  async getAnnouncements(): Promise<CmsAnnouncement[]> {
    try {
      const res = await axios.get(`${this.cmsUrl}/api/announcements`, { timeout: 3000 });
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

  async getFaqs(): Promise<CmsFaq[]> {
    try {
      const res = await axios.get(`${this.cmsUrl}/api/faq-items`, { timeout: 3000 });
      return (res.data?.data || []).map((item: Record<string, unknown>) => {
        const attrs = (item.attributes as Record<string, unknown>) || item;
        return {
          id: (item.id as string | number) || `f_${Date.now()}`,
          question: String(attrs.question || ''),
          answer: String(attrs.answer || ''),
          category: String(attrs.category || 'GENERAL'),
          targetApp: String(attrs.targetApp || attrs.appTarget || 'ALL'),
        };
      });
    } catch {
      return [];
    }
  }

  async getCmsStatus(): Promise<CmsStatusResponse> {
    try {
      const [banners, translations, faqs] = await Promise.all([
        this.getBanners(),
        this.getTranslations(),
        this.getFaqs(),
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
