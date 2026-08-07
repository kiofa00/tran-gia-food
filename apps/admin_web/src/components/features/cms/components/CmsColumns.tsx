'use client';

import { Tag, Typography } from 'antd';

import { AppTargetTag } from '@/components/shared-ui';
import { CmsBannerItem, CmsFaqItem, CmsTranslationItem } from '@/types';

const { Text } = Typography;

export function getBannerColumns() {
  return [
    {
      title: 'Tên Banner / Chiến Dịch',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: CmsBannerItem, b: CmsBannerItem) => (a.title || '').localeCompare(b.title || ''),
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Link / Deeplink Chuyển Hướng',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      render: (link?: string) =>
        link ? <Text type="secondary">{link}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active !== false ? 'success' : 'default'}>
          {active !== false ? 'ĐANG HIỂN THỊ' : 'TẠM DỪNG'}
        </Tag>
      ),
    },
  ];
}

export function getTranslationColumns() {
  return [
    {
      title: 'Key Định Danh',
      dataIndex: 'key',
      key: 'key',
      sorter: (a: CmsTranslationItem, b: CmsTranslationItem) =>
        (a.key || '').localeCompare(b.key || ''),
      render: (k: string) => <code>{k}</code>,
    },
    {
      title: 'Tiếng Việt (VI)',
      dataIndex: 'vi',
      key: 'vi',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Tiếng Anh (EN)',
      dataIndex: 'en',
      key: 'en',
      render: (v: string) => <Text type="secondary">{v || 'N/A'}</Text>,
    },
    {
      title: 'Ứng Dụng (App Target)',
      dataIndex: 'appTarget',
      key: 'appTarget',
      render: (target?: string) => <AppTargetTag target={target} />,
    },
  ];
}

export function getFaqColumns() {
  return [
    {
      title: 'Câu Hỏi (Question)',
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
      title: 'Câu Trả Lời (Answer)',
      dataIndex: 'answer',
      key: 'answer',
      render: (a: string) => <Text type="secondary">{a}</Text>,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat?: string) => <Tag color="geekblue">{cat || 'GENERAL'}</Tag>,
    },
    {
      title: 'Ứng Dụng Hỗ Trợ',
      dataIndex: 'targetApp',
      key: 'targetApp',
      render: (target?: string) => <AppTargetTag target={target} />,
    },
  ];
}
