'use client';

import { Tag, Typography } from 'antd';

import { AppTargetTag } from '@/components/shared-ui';
import { useTranslation } from '@/providers/LanguageProvider';
import { CmsBannerItem, CmsFaqItem, CmsTranslationItem } from '@/types';

const { Text } = Typography;

export function useBannerColumns() {
  const { t } = useTranslation();

  return [
    {
      title: t('cms.bannerTitle', 'Tên Banner / Chiến Dịch'),
      dataIndex: 'title',
      key: 'title',
      sorter: (a: CmsBannerItem, b: CmsBannerItem) => (a.title || '').localeCompare(b.title || ''),
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t('cms.translationTitle', 'Link / Deeplink Chuyển Hướng'),
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      render: (link?: string) =>
        link ? <Text type="secondary">{link}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: t('common.status', 'Trạng Thái'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active !== false ? 'success' : 'default'}>
          {active !== false ? t('users.active', 'ĐANG HIỂN THỊ') : t('users.suspended', 'TẠM DỪNG')}
        </Tag>
      ),
    },
  ];
}

const KNOWN_LANG_NAMES: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'Tiếng Anh',
  ja: 'Tiếng Nhật',
  zh: 'Tiếng Trung',
  ko: 'Tiếng Hàn',
  fr: 'Tiếng Pháp',
  es: 'Tây Ban Nha',
  de: 'Tiếng Đức',
};

export function useTranslationColumns(translations: CmsTranslationItem[] = []) {
  const { t } = useTranslation();
  const discoveredLangs = new Set<string>(['vi', 'en']);

  translations.forEach((item) => {
    Object.keys(item).forEach((k) => {
      if (
        k !== 'id' &&
        k !== 'key' &&
        k !== 'appTarget' &&
        k !== 'category' &&
        k !== 'createdAt' &&
        k !== 'updatedAt' &&
        typeof item[k] === 'string'
      ) {
        discoveredLangs.add(k.toLowerCase());
      }
    });
  });

  const langColumns = Array.from(discoveredLangs).map((langKey) => {
    const langLabel = KNOWN_LANG_NAMES[langKey] || langKey.toUpperCase();

    return {
      title: `${langLabel} (${langKey.toUpperCase()})`,
      dataIndex: langKey,
      key: langKey,
      render: (_: unknown, record: CmsTranslationItem) => {
        const val = record[langKey];

        return val ? (
          <Text strong={langKey === 'vi'}>{String(val)}</Text>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    };
  });

  return [
    {
      title: t('cms.translationTitle', 'Key Định Danh'),
      dataIndex: 'key',
      key: 'key',
      sorter: (a: CmsTranslationItem, b: CmsTranslationItem) =>
        (a.key || '').localeCompare(b.key || ''),
      render: (k: string) => <code>{k}</code>,
    },
    ...langColumns,
    {
      title: t('users.role', 'Ứng Dụng (App Target)'),
      dataIndex: 'appTarget',
      key: 'appTarget',
      render: (target?: string) => <AppTargetTag target={target} />,
    },
  ];
}

export function useFaqColumns() {
  const { t } = useTranslation();

  return [
    {
      title: t('cms.faqTitle', 'Câu Hỏi (Question)'),
      dataIndex: 'question',
      key: 'question',
      sorter: (a: CmsFaqItem, b: CmsFaqItem) => (a.question || '').localeCompare(b.question || ''),
      render: (q: string) => (
        <Text strong className="text-orange-500">
          {q}
        </Text>
      ),
    },
    {
      title: t('cms.faqTitle', 'Câu Trả Lời (Answer)'),
      dataIndex: 'answer',
      key: 'answer',
      render: (a: string) => <Text type="secondary">{a}</Text>,
    },
    {
      title: t('users.role', 'Danh Mục'),
      dataIndex: 'category',
      key: 'category',
      render: (cat?: string) => <Tag color="geekblue">{cat || 'GENERAL'}</Tag>,
    },
    {
      title: t('users.role', 'Ứng Dụng Hỗ Trợ'),
      dataIndex: 'targetApp',
      key: 'targetApp',
      render: (target?: string) => <AppTargetTag target={target} />,
    },
  ];
}
