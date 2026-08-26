'use client';

import React from 'react';

import Link from 'next/link';

import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  CarOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TagOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Card, Typography } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import type { TranslationKey } from '@/lib/i18n';
import { ADMIN_ROUTES } from '@/shared-config';

const { Text, Title } = Typography;

interface ModuleLinkItem {
  key: string;
  titleKey: TranslationKey;
  defaultTitle: string;
  descKey: TranslationKey;
  defaultDesc: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  badgeText: string;
}

export function DashboardQuickLinks() {
  const { t } = useLocale();

  const moduleItems: ModuleLinkItem[] = [
    {
      key: 'analytics',
      titleKey: 'dashboard.quickLinks.analyticsTitle',
      defaultTitle: 'Báo Cáo & Phân Tích',
      descKey: 'dashboard.quickLinks.analyticsDesc',
      defaultDesc: 'Theo dõi biểu đồ doanh số GMV, hoa hồng và phương thức thanh toán',
      href: ADMIN_ROUTES.ANALYTICS,
      icon: <BarChartOutlined className="text-xl text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      badgeText: 'Finance',
    },
    {
      key: 'restaurants',
      titleKey: 'dashboard.quickLinks.restaurantsTitle',
      defaultTitle: 'Quán Ăn & Thực Đơn',
      descKey: 'dashboard.quickLinks.restaurantsDesc',
      defaultDesc: 'Giám sát đối tác nhà hàng, menu món ăn và trạng thái mở quán',
      href: ADMIN_ROUTES.RESTAURANTS,
      icon: <ShopOutlined className="text-xl text-orange-600" />,
      iconBg: 'bg-orange-50',
      badgeText: 'Operations',
    },
    {
      key: 'fleet',
      titleKey: 'dashboard.quickLinks.fleetTitle',
      defaultTitle: 'Đội Ngũ Tài Xế (Fleet)',
      descKey: 'dashboard.quickLinks.fleetDesc',
      defaultDesc: 'Theo dõi vị trí shipper realtime trên bản đồ và giám sát đơn giao',
      href: ADMIN_ROUTES.FLEET,
      icon: <CarOutlined className="text-xl text-blue-600" />,
      iconBg: 'bg-blue-50',
      badgeText: 'Fleet',
    },
    {
      key: 'kyc',
      titleKey: 'dashboard.quickLinks.kycTitle',
      defaultTitle: 'Trung Tâm Duyệt eKYC',
      descKey: 'dashboard.quickLinks.kycDesc',
      defaultDesc: 'Thẩm định ảnh CCCD 2 mặt, bằng lái, đăng ký xe và kích hoạt tài xế',
      href: ADMIN_ROUTES.KYC,
      icon: <SafetyCertificateOutlined className="text-xl text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      badgeText: 'Security',
    },
    {
      key: 'payouts',
      titleKey: 'dashboard.quickLinks.payoutsTitle',
      defaultTitle: 'Quyết Toán & Rút Tiền',
      descKey: 'dashboard.quickLinks.payoutsDesc',
      defaultDesc: 'Đối soát số dư ví, giải ngân và duyệt lệnh rút tiền của đối tác',
      href: ADMIN_ROUTES.PAYOUTS,
      icon: <WalletOutlined className="text-xl text-purple-600" />,
      iconBg: 'bg-purple-50',
      badgeText: 'Finance',
    },
    {
      key: 'vouchers',
      titleKey: 'dashboard.quickLinks.vouchersTitle',
      defaultTitle: 'Mã Khuyến Mãi & Voucher',
      descKey: 'dashboard.quickLinks.vouchersDesc',
      defaultDesc: 'Tạo chiến dịch marketing, mã giảm giá và ngân sách ưu đãi',
      href: ADMIN_ROUTES.VOUCHERS,
      icon: <TagOutlined className="text-xl text-rose-600" />,
      iconBg: 'bg-rose-50',
      badgeText: 'Marketing',
    },
    {
      key: 'commissions',
      titleKey: 'dashboard.quickLinks.commissionsTitle',
      defaultTitle: 'Hoa Hồng & Chiết Khấu',
      descKey: 'dashboard.quickLinks.commissionsDesc',
      defaultDesc: 'Chi tiết dòng tiền phân bổ hoa hồng sàn và cước phí theo từng đơn hàng',
      href: ADMIN_ROUTES.COMMISSIONS,
      icon: <DollarOutlined className="text-xl text-teal-600" />,
      iconBg: 'bg-teal-50',
      badgeText: 'Finance',
    },
    {
      key: 'users',
      titleKey: 'dashboard.quickLinks.usersTitle',
      defaultTitle: 'Người Dùng & Phân Quyền',
      descKey: 'dashboard.quickLinks.usersDesc',
      defaultDesc: 'Quản lý tài khoản khách hàng, shipper, chủ quán và phân quyền',
      href: ADMIN_ROUTES.USERS,
      icon: <TeamOutlined className="text-xl text-cyan-600" />,
      iconBg: 'bg-cyan-50',
      badgeText: 'Users',
    },
    {
      key: 'cms',
      titleKey: 'dashboard.quickLinks.cmsTitle',
      defaultTitle: 'Quản Trị CMS & Nội Dung',
      descKey: 'dashboard.quickLinks.cmsDesc',
      defaultDesc: 'Quản lý banner quảng cáo, FAQ hỗ trợ và dữ liệu dịch thuật đa ngôn ngữ',
      href: ADMIN_ROUTES.CMS,
      icon: <AppstoreOutlined className="text-xl text-slate-600" />,
      iconBg: 'bg-slate-100',
      badgeText: 'System',
    },
  ];

  return (
    <div className="mt-8">
      <div className="mb-4">
        <Title level={4} className="!mb-1">
          {t('dashboard.quickLinksTitle', '🚀 Trung Tâm Phân Hệ Quản Trị & Lối Tắt')}
        </Title>
        <Text type="secondary" className="text-sm">
          {t(
            'dashboard.quickLinksSubtitle',
            'Truy cập nhanh và quản trị toàn diện 9 phân hệ chức năng trên hệ thống',
          )}
        </Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleItems.map((item) => (
          <Link href={item.href} key={item.key} className="flex flex-col group h-full">
            <Card
              variant="borderless"
              styles={{
                body: {
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                },
              }}
              className="rounded-xl shadow-xs border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-200 h-full cursor-pointer bg-white"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.iconBg}`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.badgeText}
                  </span>
                </div>

                <Text
                  strong
                  className="text-base text-slate-900 group-hover:text-orange-500 transition-colors block mb-1"
                >
                  {t(item.titleKey, item.defaultTitle)}
                </Text>

                <Text
                  type="secondary"
                  className="text-xs text-slate-500 block mb-4 leading-relaxed line-clamp-2"
                >
                  {t(item.descKey, item.defaultDesc)}
                </Text>
              </div>

              <div className="flex items-center text-xs font-semibold text-orange-500 group-hover:translate-x-1 transition-transform pt-2">
                <span>{t('dashboard.quickLinks.openModule', 'Mở phân hệ')}</span>
                <ArrowRightOutlined className="ml-1 text-[10px]" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
