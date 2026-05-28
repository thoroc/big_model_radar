/**
 * Locale data loader — reads all JSON files from locales/, validates them
 * with a Zod schema, and exports the parsed data, supported locales list,
 * language names, and the t() translation accessor.
 *
 * Initialization is lazy (deferred until first t() or validateLocale call)
 * so that tests mocking node:fs can set up their mocks first.
 *
 * If loading fails (e.g. in tests with mocked fs), t() returns a proxy that
 * yields empty strings for every key — no undefined crashes.
 *
 * Adding a new language = drop a valid JSON file into locales/.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LocaleFileSchema, type LocaleData } from "./locale-schema";

type LocaleStrings = LocaleData;

// ---------------------------------------------------------------------------
// Lazy initializer
// ---------------------------------------------------------------------------

let _initialized = false;

export const SUPPORTED_LOCALES: string[] = [];
export const STRINGS: Record<string, LocaleStrings> = {};
export const LANGUAGE_NAMES: Record<string, string> = {};

function ensureLocales(): void {
  if (_initialized) return;
  _initialized = true;

  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const localesDir = path.resolve(__dirname, "../locales");

    if (!fs.existsSync(localesDir)) {
      console.warn(`[strings] locales directory not found: ${localesDir}`);
      return;
    }

    const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const code = path.basename(file, ".json");
      const raw = JSON.parse(fs.readFileSync(path.join(localesDir, file), "utf-8"));
      const parsed = LocaleFileSchema.parse(raw);
      const { _meta, ...data } = parsed;
      STRINGS[code] = data;
      LANGUAGE_NAMES[code] = _meta.name;
      SUPPORTED_LOCALES.push(code);
    }
  } catch (err) {
    console.warn(`[strings] Failed to load locales: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Fallback — used when locale files can't be loaded (e.g. in tests)
// ---------------------------------------------------------------------------

const EMPTY_FALLBACK = new Proxy({} as LocaleStrings, { get: () => "" });

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

export const validateLocale = (lang: string): string => {
  ensureLocales();
  if (SUPPORTED_LOCALES.includes(lang)) return lang;
  console.warn(`Unsupported locale "${lang}", falling back to "en"`);
  return "en";
};

export const t = (lang?: string): LocaleStrings => {
  ensureLocales();
  const locale = lang ? validateLocale(lang) : "en";
  return STRINGS[locale] ?? STRINGS.en ?? EMPTY_FALLBACK;
};
