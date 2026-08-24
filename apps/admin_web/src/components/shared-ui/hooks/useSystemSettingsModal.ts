import { useCallback, useEffect, useState } from 'react';

import { Form, message } from 'antd';

import { useLocale } from '@/hooks/useLocale';
import { adminService } from '@/services/admin.service';
import { DEFAULT_SYSTEM_SETTINGS, SYSTEM_SETTINGS_CONFIG_KEYS } from '@/shared-config';

interface UseSystemSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function useSystemSettingsModal({ open, onClose }: UseSystemSettingsModalProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const configs = await adminService.getAppConfigs();
      const values: Record<string, unknown> = {};

      configs.forEach((cfg) => {
        if (cfg.key === SYSTEM_SETTINGS_CONFIG_KEYS.PLATFORM_FEE_RATE) {
          values[cfg.key] = Math.round(parseFloat(cfg.value) * 100);
        } else if (
          cfg.key === SYSTEM_SETTINGS_CONFIG_KEYS.BASE_SHIP_FEE ||
          cfg.key === SYSTEM_SETTINGS_CONFIG_KEYS.SHIP_FEE_PER_KM ||
          cfg.key === SYSTEM_SETTINGS_CONFIG_KEYS.SHIPPER_COUNTDOWN_SECONDS
        ) {
          values[cfg.key] = parseInt(cfg.value, 10);
        } else if (cfg.key === SYSTEM_SETTINGS_CONFIG_KEYS.KYC_AUTO_APPROVAL) {
          values[cfg.key] = cfg.value === 'true';
        } else {
          values[cfg.key] = cfg.value;
        }
      });
      form.setFieldsValue(values);
    } catch {
      // Fallback to default constants
      form.setFieldsValue(DEFAULT_SYSTEM_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (open) {
      loadConfigs();
    }
  }, [open, loadConfigs]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      setSaving(true);
      const feeRateNum =
        Number(values.platform_fee_rate) || DEFAULT_SYSTEM_SETTINGS.platform_fee_rate;
      const updates = [
        adminService.setAppConfig(
          SYSTEM_SETTINGS_CONFIG_KEYS.PLATFORM_FEE_RATE,
          (feeRateNum / 100).toFixed(2),
        ),
        adminService.setAppConfig(
          SYSTEM_SETTINGS_CONFIG_KEYS.BASE_SHIP_FEE,
          String(values.base_ship_fee || DEFAULT_SYSTEM_SETTINGS.base_ship_fee),
        ),
        adminService.setAppConfig(
          SYSTEM_SETTINGS_CONFIG_KEYS.SHIP_FEE_PER_KM,
          String(values.ship_fee_per_km || DEFAULT_SYSTEM_SETTINGS.ship_fee_per_km),
        ),
        adminService.setAppConfig(
          SYSTEM_SETTINGS_CONFIG_KEYS.SHIPPER_COUNTDOWN_SECONDS,
          String(
            values.shipper_countdown_seconds || DEFAULT_SYSTEM_SETTINGS.shipper_countdown_seconds,
          ),
        ),
        adminService.setAppConfig(
          SYSTEM_SETTINGS_CONFIG_KEYS.KYC_AUTO_APPROVAL,
          String(Boolean(values.kyc_auto_approval)),
        ),
        adminService.setAppConfig(
          SYSTEM_SETTINGS_CONFIG_KEYS.HOTLINE_SUPPORT,
          String(values.hotline_support || DEFAULT_SYSTEM_SETTINGS.hotline_support),
        ),
        adminService.setAppConfig(
          SYSTEM_SETTINGS_CONFIG_KEYS.APP_VERSION_MIN,
          String(values.app_version_min || DEFAULT_SYSTEM_SETTINGS.app_version_min),
        ),
      ];

      await Promise.all(updates);
      message.success(t('settings.saveSuccess', 'Đã lưu cấu hình hệ thống thành công!'));
      onClose();
    } catch {
      message.error(t('settings.saveError', 'Lỗi lưu cấu hình, vui lòng thử lại!'));
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    loading,
    saving,
    loadConfigs,
    handleSave,
    t,
  };
}
