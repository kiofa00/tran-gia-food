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
  key: string;
  label: string;
  iconName: IconName;
}

export interface NavGroupConfig {
  key: string;
  label: string;
  iconName?: IconName;
  href?: string;
  children?: NavLinkConfig[];
}

export const ADMIN_NAV_GROUPS: NavGroupConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    iconName: 'DashboardOutlined',
    href: ADMIN_ROUTES.HOME,
  },
  {
    key: 'operations',
    label: 'Vận Hành',
    iconName: 'ShopOutlined',
    children: [
      { key: ADMIN_ROUTES.RESTAURANTS, label: 'Nhà Hàng', iconName: 'ShopOutlined' },
      { key: ADMIN_ROUTES.FLEET, label: 'Đội Xe', iconName: 'CarOutlined' },
      { key: ADMIN_ROUTES.KYC, label: 'Duyệt eKYC', iconName: 'SafetyCertificateOutlined' },
      { key: ADMIN_ROUTES.USERS, label: 'Người Dùng', iconName: 'TeamOutlined' },
    ],
  },
  {
    key: 'finance',
    label: 'Tài Chính',
    iconName: 'DollarOutlined',
    children: [
      { key: ADMIN_ROUTES.COMMISSIONS, label: 'Hoa Hồng & Ví', iconName: 'DollarOutlined' },
      { key: ADMIN_ROUTES.PAYOUTS, label: 'Giải Ngân', iconName: 'WalletOutlined' },
      { key: ADMIN_ROUTES.VOUCHERS, label: 'Mã Giảm Giá', iconName: 'TagOutlined' },
    ],
  },
  {
    key: 'analytics',
    label: 'Báo Cáo',
    iconName: 'BarChartOutlined',
    href: ADMIN_ROUTES.ANALYTICS,
  },
  {
    key: 'cms',
    label: 'CMS',
    iconName: 'FileTextOutlined',
    href: ADMIN_ROUTES.CMS,
  },
];

export const ADMIN_NAV_LINKS: NavLinkConfig[] = [
  { key: ADMIN_ROUTES.HOME, label: 'Dashboard', iconName: 'DashboardOutlined' },
  { key: ADMIN_ROUTES.RESTAURANTS, label: 'Nha Hang', iconName: 'ShopOutlined' },
  { key: ADMIN_ROUTES.FLEET, label: 'Doi Xe', iconName: 'CarOutlined' },
  { key: ADMIN_ROUTES.KYC, label: 'Duyet KYC', iconName: 'SafetyCertificateOutlined' },
  { key: ADMIN_ROUTES.USERS, label: 'Nguoi Dung', iconName: 'TeamOutlined' },
  { key: ADMIN_ROUTES.VOUCHERS, label: 'Ma Giam Gia', iconName: 'TagOutlined' },
  { key: ADMIN_ROUTES.COMMISSIONS, label: 'Hoa Hong & Vi', iconName: 'DollarOutlined' },
  { key: ADMIN_ROUTES.PAYOUTS, label: 'Giai Ngan', iconName: 'WalletOutlined' },
  { key: ADMIN_ROUTES.ANALYTICS, label: 'Bao Cao', iconName: 'BarChartOutlined' },
  { key: ADMIN_ROUTES.CMS, label: 'CMS', iconName: 'FileTextOutlined' },
];
