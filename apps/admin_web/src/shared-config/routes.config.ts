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

export interface NavLinkConfig {
  key: string;
  label: string;
  iconName:
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
}

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
