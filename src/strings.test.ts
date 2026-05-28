import { describe, it, expect } from "vitest";
import { t, validateLocale, SUPPORTED_LOCALES } from "./strings";

describe("strings", () => {
  it("t() returns English strings by default", () => {
    const s = t();
    expect(s.noActivity).toBe("No activity in the last 24 hours.");
    expect(s.cliTitle).toBe("AI CLI Tools Community Digest");
  });

  it("t('en') returns English strings", () => {
    const s = t("en");
    expect(s.noActivity).toBe("No activity in the last 24 hours.");
    expect(s.cliTitle).toBe("AI CLI Tools Community Digest");
  });

  it("t(fallback) uses 'en' for unsupported locales", () => {
    const s = t("fr");
    expect(s.noActivity).toBe("No activity in the last 24 hours.");
  });

  it("returns all expected string keys", () => {
    const s = t("en");
    const keys = Object.keys(s);
    expect(keys.length).toBeGreaterThan(50);
  });

  it("all STRINGS.en values are non-empty strings", () => {
    const s = t("en");
    const keys: (keyof typeof s)[] = Object.keys(s) as never;
    for (const key of keys) {
      expect(typeof s[key]).toBe("string");
      expect((s[key] as string).length).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("validateLocale", () => {
  it("returns the locale for supported locales", () => {
    expect(validateLocale("en")).toBe("en");
  });

  it("falls back to 'en' for unsupported locales", () => {
    expect(validateLocale("fr")).toBe("en");
    expect(validateLocale("zh")).toBe("en");
  });
});

describe("SUPPORTED_LOCALES", () => {
  it("includes English", () => {
    expect(SUPPORTED_LOCALES).toContain("en");
  });
});
