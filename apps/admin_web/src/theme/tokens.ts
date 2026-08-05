import baseTokens from '../../../../packages/shared_ui/tokens/base.json';
import adminTokens from '../../../../packages/shared_ui/tokens/admin-web.json';

export const baseColorTokens = baseTokens;

/// Programmatic Design Tokens for Admin Web Dashboard (0 hardcoded hex/fontSize)
export const adminDesignTokens = {
  colors: {
    primary: baseTokens['orange-500'],
    primaryHover: baseTokens['orange-400'],
    secondary: baseTokens['yellow-400'],
    background: '#f8f9fa',
    surface: baseTokens['white'],
    border: '#e9ecef',
    textPrimary: baseTokens['gray-900'],
    textSecondary: '#6c757d',
    textMuted: '#495057',
    statusApproved: baseTokens['green-500'],
    statusPending: baseTokens['orange-amber'],
    statusRejected: baseTokens['red-500'],
    statusPendingBg: '#fff3cd',
  },
  fontSize: {
    xs: '12px',
    sm: '13px',
    body: '14px',
    title: '16px',
    lg: '20px',
    xl: '26px',
    h1: '28px',
  },
  fontWeight: {
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '12px',
  },
  padding: {
    sm: '12px',
    md: '24px',
    lg: '32px',
  },
};
