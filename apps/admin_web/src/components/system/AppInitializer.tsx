'use client';

import { useLocaleHelper } from '@/hooks/useLocale';

/**
 * Global App Initializer (mounted at RootLayout inside Providers)
 * Responsible for client-side runtime singletons like useLocaleHelper
 */
export function AppInitializer() {
  useLocaleHelper();

  return null;
}
