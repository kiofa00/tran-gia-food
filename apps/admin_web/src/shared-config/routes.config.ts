import type { TranslationKey } from '@/lib/i18n';

export const ADMIN_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FLEET: '/fleet',
  VOUCHERS: '/vouchers',
  COMMISSIONS: '/commissions',
  ANALYTICS: '/analytics',
  CMS: '/cms',
  USERS: '/users',
  RESTAURANTS: '/restaurants',
  PAYOUTS: '/payouts',
  KYC: '/kyc',
} as const;

export type IconName =
  | 'DashboardOutlined'
  | 'CarOutlined'
  | 'TagOutlined'
  | 'DollarOutlined'
  | 'BarChartOutlined'
  | 'FileTextOutlined'
  | 'TeamOutlined'
  | 'ShopOutlined'
  | 'WalletOutlined'
  | 'SafetyCertificateOutlined';

export interface NavLinkConfig {
  readonly key: string;
  readonly label: string;
  readonly translationKey: TranslationKey;
  readonly iconName: IconName;
}

export interface NavGroupConfig {
  readonly key: string;
  readonly label: string;
  readonly translationKey: TranslationKey;
  readonly iconName?: IconName;
  readonly href?: string;
  readonly children?: readonly NavLinkConfig[];
}

export const ADMIN_NAV_GROUPS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    translationKey: 'nav.dashboard',
    iconName: 'DashboardOutlined',
    href: ADMIN_ROUTES.HOME,
  },
  {
    key: 'operations',
    label: 'Vận Hành',
    translationKey: 'nav.operations',
    iconName: 'ShopOutlined',
    children: [
      {
        key: ADMIN_ROUTES.RESTAURANTS,
        label: 'Nhà Hàng',
        translationKey: 'nav.restaurants',
        iconName: 'ShopOutlined',
      },
      {
        key: ADMIN_ROUTES.FLEET,
        label: 'Đội Xe',
        translationKey: 'nav.fleet',
        iconName: 'CarOutlined',
      },
      {
        key: ADMIN_ROUTES.KYC,
        label: 'Duyệt eKYC',
        translationKey: 'nav.kyc',
        iconName: 'SafetyCertificateOutlined',
      },
      {
        key: ADMIN_ROUTES.USERS,
        label: 'Người Dùng',
        translationKey: 'nav.users',
        iconName: 'TeamOutlined',
      },
    ],
  },
  {
    key: 'finance',
    label: 'Tài Chính',
    translationKey: 'nav.finance',
    iconName: 'DollarOutlined',
    children: [
      {
        key: ADMIN_ROUTES.COMMISSIONS,
        label: 'Hoa Hồng & Ví',
        translationKey: 'nav.commissions',
        iconName: 'DollarOutlined',
      },
      {
        key: ADMIN_ROUTES.PAYOUTS,
        label: 'Giải Ngân',
        translationKey: 'nav.payouts',
        iconName: 'WalletOutlined',
      },
      {
        key: ADMIN_ROUTES.VOUCHERS,
        label: 'Mã Giảm Giá',
        translationKey: 'nav.vouchers',
        iconName: 'TagOutlined',
      },
    ],
  },
  {
    key: 'analytics',
    label: 'Báo Cáo',
    translationKey: 'nav.analytics',
    iconName: 'BarChartOutlined',
    href: ADMIN_ROUTES.ANALYTICS,
  },
  {
    key: 'cms',
    label: 'CMS',
    translationKey: 'nav.cms',
    iconName: 'FileTextOutlined',
    href: ADMIN_ROUTES.CMS,
  },
] as const satisfies readonly NavGroupConfig[];

export const ADMIN_NAV_LINKS = [
  {
    key: ADMIN_ROUTES.HOME,
    label: 'Dashboard',
    translationKey: 'nav.dashboard',
    iconName: 'DashboardOutlined',
  },
  {
    key: ADMIN_ROUTES.RESTAURANTS,
    label: 'Nhà Hàng',
    translationKey: 'nav.restaurants',
    iconName: 'ShopOutlined',
  },
  {
    key: ADMIN_ROUTES.FLEET,
    label: 'Đội Xe',
    translationKey: 'nav.fleet',
    iconName: 'CarOutlined',
  },
  {
    key: ADMIN_ROUTES.KYC,
    label: 'Duyệt eKYC',
    translationKey: 'nav.kyc',
    iconName: 'SafetyCertificateOutlined',
  },
  {
    key: ADMIN_ROUTES.USERS,
    label: 'Người Dùng',
    translationKey: 'nav.users',
    iconName: 'TeamOutlined',
  },
  {
    key: ADMIN_ROUTES.VOUCHERS,
    label: 'Mã Giảm Giá',
    translationKey: 'nav.vouchers',
    iconName: 'TagOutlined',
  },
  {
    key: ADMIN_ROUTES.COMMISSIONS,
    label: 'Hoa Hồng & Ví',
    translationKey: 'nav.commissions',
    iconName: 'DollarOutlined',
  },
  {
    key: ADMIN_ROUTES.PAYOUTS,
    label: 'Giải Ngân',
    translationKey: 'nav.payouts',
    iconName: 'WalletOutlined',
  },
  {
    key: ADMIN_ROUTES.ANALYTICS,
    label: 'Báo Cáo',
    translationKey: 'nav.analytics',
    iconName: 'BarChartOutlined',
  },
  {
    key: ADMIN_ROUTES.CMS,
    label: 'CMS',
    translationKey: 'nav.cms',
    iconName: 'FileTextOutlined',
  },
] as const satisfies readonly NavLinkConfig[];
