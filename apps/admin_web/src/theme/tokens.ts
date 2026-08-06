import baseJson from '@tokens/base.json';

export const baseColors = baseJson.colors;
export const baseFontFamily = baseJson.fontFamily;
export const baseBorderRadius = baseJson.borderRadius;
export const baseTypography = baseJson.typography;
export const baseFontWeight = baseJson.fontWeight;
export const baseSpacing = baseJson.spacing;
export const baseBoxShadow = baseJson.boxShadow;

/// Programmatic Design Tokens for Admin Web Dashboard (0 hardcoded hex/fontSize)
export const adminDesignTokens = {
  colors: {
    // Core brand
    primary: baseColors['orange-500'],
    primaryHover: baseColors['orange-400'],
    primaryDark: baseColors['orange-600'],
    secondary: baseColors['yellow-400'],
    background: baseColors['cream-100'],
    surface: baseColors['white'],
    surfaceAlt: baseColors['cream-200'],
    border: baseColors['gray-200'],
    textPrimary: baseColors['gray-900'],
    textSecondary: baseColors['gray-600'],
    textMuted: baseColors['gray-400'],
    // Status / semantic
    statusApproved: baseColors['green-500'],
    statusPending: baseColors['orange-amber'],
    statusRejected: baseColors['red-500'],
    statusInfo: baseColors['blue-500'],
    // Stat card value colors (replace inline #hex in valueStyle)
    statOrange: baseColors['orange-500'], // primary revenue
    statGreen: baseColors['green-500'], // GMV / restaurant share
    statBlue: baseColors['blue-500'], // shipping / orders
    statPurple: baseColors['purple-500'], // shippers / AOV
    // Chart series colors (Recharts gradients & strokes)
    chartGreen: baseColors['chart-green'], // Ant Design success green — revenue area
    chartBlue: baseColors['chart-blue'], // Ant Design primary blue — bar chart orders
  },
  fontFamily: baseFontFamily,
  typography: baseTypography,
  fontWeight: baseFontWeight,
  // Numeric aliases consumed by Ant Design `valueStyle` (must be number)
  // Derived from base token strings — no raw literals
  fontSizeXl: parseInt(baseTypography['xl'][0] as string, 10) + 2, // "22px" + 2 = 24, aligns with Ant h2 size
  fontWeightBold: parseInt(baseFontWeight['bold'] as string, 10), // "700"
  // ConfigProvider borderRadius token (number, px value of rounded-sm = "10px")
  borderRadiusAntd: parseInt(baseBorderRadius['rounded-sm'] as string, 10), // "10px" → 10
  borderRadius: {
    sm: baseBorderRadius['rounded-xs'],
    md: baseBorderRadius['rounded-sm'],
    lg: baseBorderRadius['rounded-md'],
    xl: baseBorderRadius['rounded-lg'],
    full: baseBorderRadius['rounded-full'],
  },
  spacing: baseSpacing,
  boxShadow: baseBoxShadow,
};
