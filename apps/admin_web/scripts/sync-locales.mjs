/**
 * i18n Locale Generator & Sync Script (0 Hardcoded Strings)
 * Fetches translations dynamically from CMS API and generates local JSON locale files in src/locales/
 */
import console from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const fetch = globalThis.fetch;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CMS_API_URL = process.env.CMS_API_URL;
const STRAPI_DIRECT_URL = process.env.STRAPI_URL;
const LOCALES_DIR = path.join(__dirname, '../src/locales');

async function syncLocales() {
  console.log('🔄 Connecting to CMS API to fetch live translations...');
  let rawTranslations = [];

  // 1. Try NestJS Backend CMS status endpoint
  try {
    const res = await fetch(CMS_API_URL, { timeout: 3000 });

    if (res.ok) {
      const json = await res.json();

      if (json?.translations && Array.isArray(json.translations)) {
        rawTranslations = json.translations;
        console.log(
          `✅ Fetched ${rawTranslations.length} translation records from NestJS CMS API.`,
        );
      }
    }
  } catch {
    /* Fallback to direct Strapi endpoint if NestJS API is offline */
  }

  // 2. Try direct Strapi CMS endpoint if NestJS backend was offline or empty
  if (rawTranslations.length === 0) {
    try {
      const res = await fetch(STRAPI_DIRECT_URL, { timeout: 3000 });

      if (res.ok) {
        const json = await res.json();
        const items = json?.data || [];

        rawTranslations = items.map((item) => {
          const attrs = item.attributes || item;

          return { ...attrs, id: item.id };
        });
        console.log(
          `✅ Fetched ${rawTranslations.length} translation records directly from Strapi CMS.`,
        );
      }
    } catch {
      console.warn('⚠️ Both CMS endpoints are currently offline.');
    }
  }

  if (rawTranslations.length === 0) {
    console.log('ℹ️ No CMS translations received. Skipping locale JSON generation.');

    return;
  }

  const langDicts = {};

  rawTranslations.forEach((item) => {
    if (!item.key) return;
    Object.keys(item).forEach((k) => {
      if (['id', 'key', 'appTarget', 'category', 'createdAt', 'updatedAt'].includes(k)) return;
      const lang = k.toLowerCase();

      if (!langDicts[lang]) langDicts[lang] = {};
      langDicts[lang][item.key] = String(item[k] || '');
    });
  });

  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR, { recursive: true });
  }

  Object.entries(langDicts).forEach(([lang, dict]) => {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);

    fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), 'utf-8');
    console.log(`📄 Generated: src/locales/${lang}.json (${Object.keys(dict).length} keys)`);
  });

  console.log('🎉 i18n sync completed!');
}

syncLocales();
