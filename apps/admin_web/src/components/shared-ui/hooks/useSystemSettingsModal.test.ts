import { describe, expect, it, vi } from 'vitest';

import { adminService } from '@/services/admin.service';
import {
  DEFAULT_SYSTEM_SETTINGS,
  SYSTEM_SETTINGS_CONFIG_KEYS,
  SYSTEM_SETTINGS_LIMITS,
} from '@/shared-config';

vi.mock('@/services/admin.service', () => ({
  adminService: {
    getAppConfigs: vi.fn(),
    setAppConfig: vi.fn(),
  },
}));

describe('adminService system settings configuration logic', () => {
  it('has valid default system settings constants', () => {
    expect(DEFAULT_SYSTEM_SETTINGS.platform_fee_rate).toBe(20);
    expect(DEFAULT_SYSTEM_SETTINGS.base_ship_fee).toBe(15000);
    expect(DEFAULT_SYSTEM_SETTINGS.ship_fee_per_km).toBe(5000);
    expect(DEFAULT_SYSTEM_SETTINGS.shipper_countdown_seconds).toBe(60);
    expect(DEFAULT_SYSTEM_SETTINGS.kyc_auto_approval).toBe(false);
    expect(DEFAULT_SYSTEM_SETTINGS.hotline_support).toBe('1900 6868');
    expect(DEFAULT_SYSTEM_SETTINGS.app_version_min).toBe('1.0.0');
  });

  it('has valid system setting limits', () => {
    expect(SYSTEM_SETTINGS_LIMITS.PLATFORM_FEE_MIN).toBe(0);
    expect(SYSTEM_SETTINGS_LIMITS.PLATFORM_FEE_MAX).toBe(100);
    expect(SYSTEM_SETTINGS_LIMITS.BASE_SHIP_FEE_STEP).toBe(1000);
    expect(SYSTEM_SETTINGS_LIMITS.COUNTDOWN_MIN).toBe(15);
    expect(SYSTEM_SETTINGS_LIMITS.COUNTDOWN_MAX).toBe(180);
  });

  it('calls getAppConfigs and parses response correctly', async () => {
    const mockConfigs = [
      { id: '1', key: SYSTEM_SETTINGS_CONFIG_KEYS.PLATFORM_FEE_RATE, value: '0.25' },
      { id: '2', key: SYSTEM_SETTINGS_CONFIG_KEYS.BASE_SHIP_FEE, value: '20000' },
      { id: '3', key: SYSTEM_SETTINGS_CONFIG_KEYS.KYC_AUTO_APPROVAL, value: 'true' },
    ];

    vi.mocked(adminService.getAppConfigs).mockResolvedValue(mockConfigs);

    const configs = await adminService.getAppConfigs();

    expect(adminService.getAppConfigs).toHaveBeenCalledTimes(1);
    expect(configs).toEqual(mockConfigs);
  });

  it('calls setAppConfig with key and string value', async () => {
    const mockResult = {
      id: '1',
      key: SYSTEM_SETTINGS_CONFIG_KEYS.BASE_SHIP_FEE,
      value: '20000',
    };

    vi.mocked(adminService.setAppConfig).mockResolvedValue(mockResult);

    const res = await adminService.setAppConfig(SYSTEM_SETTINGS_CONFIG_KEYS.BASE_SHIP_FEE, '20000');

    expect(adminService.setAppConfig).toHaveBeenCalledWith(
      SYSTEM_SETTINGS_CONFIG_KEYS.BASE_SHIP_FEE,
      '20000',
    );
    expect(res).toEqual(mockResult);
  });
});
