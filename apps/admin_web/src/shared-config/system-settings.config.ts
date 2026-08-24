export const DEFAULT_SYSTEM_SETTINGS = {
  platform_fee_rate: 20,
  base_ship_fee: 15000,
  ship_fee_per_km: 5000,
  shipper_countdown_seconds: 60,
  kyc_auto_approval: false,
  hotline_support: '1900 6868',
  app_version_min: '1.0.0',
} as const;

export const SYSTEM_SETTINGS_LIMITS = {
  PLATFORM_FEE_MIN: 0,
  PLATFORM_FEE_MAX: 100,
  BASE_SHIP_FEE_MIN: 0,
  BASE_SHIP_FEE_STEP: 1000,
  SHIP_FEE_PER_KM_MIN: 0,
  SHIP_FEE_PER_KM_STEP: 500,
  COUNTDOWN_MIN: 15,
  COUNTDOWN_MAX: 180,
} as const;

export const SYSTEM_SETTINGS_CONFIG_KEYS = {
  PLATFORM_FEE_RATE: 'platform_fee_rate',
  BASE_SHIP_FEE: 'base_ship_fee',
  SHIP_FEE_PER_KM: 'ship_fee_per_km',
  SHIPPER_COUNTDOWN_SECONDS: 'shipper_countdown_seconds',
  KYC_AUTO_APPROVAL: 'kyc_auto_approval',
  HOTLINE_SUPPORT: 'hotline_support',
  APP_VERSION_MIN: 'app_version_min',
} as const;
