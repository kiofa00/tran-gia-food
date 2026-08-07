export const ADMIN_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FLEET: '/fleet',
  VOUCHERS: '/vouchers',
  COMMISSIONS: '/commissions',
  ANALYTICS: '/analytics',
  CMS: '/cms',
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
    | 'FileTextOutlined';
}

export const ADMIN_NAV_LINKS: NavLinkConfig[] = [
  { key: ADMIN_ROUTES.HOME, label: 'Dashboard', iconName: 'DashboardOutlined' },
  { key: ADMIN_ROUTES.FLEET, label: 'Đội Xe', iconName: 'CarOutlined' },
  { key: ADMIN_ROUTES.VOUCHERS, label: 'Mã Giảm Giá', iconName: 'TagOutlined' },
  { key: ADMIN_ROUTES.COMMISSIONS, label: 'Hoa Hồng & Ví', iconName: 'DollarOutlined' },
  { key: ADMIN_ROUTES.ANALYTICS, label: 'Báo Cáo', iconName: 'BarChartOutlined' },
  { key: ADMIN_ROUTES.CMS, label: 'CMS', iconName: 'FileTextOutlined' },
];
