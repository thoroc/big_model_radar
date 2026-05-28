import { describe, it, expect, vi, afterEach } from "vitest";
import { t, SUPPORTED_LOCALES, LANGUAGE_NAMES } from "./strings";
import { resolveFilename, resolveLabel, autoGenFooter } from "./locale";

describe("LANGUAGE_NAMES", () => {
  it("maps every SUPPORTED_LOCALES code to a name", () => {
    t(); // ensure locales are loaded
    for (const code of SUPPORTED_LOCALES) {
      const name = LANGUAGE_NAMES[code];
      expect(name).toBeDefined();
      expect(name!.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveFilename", () => {
  it("returns base.md for English", () => {
    expect(resolveFilename("ai-cli")).toBe("ai-cli.md");
    expect(resolveFilename("ai-cli", "en")).toBe("ai-cli.md");
  });

  it("returns base-lang.md for non-English", () => {
    expect(resolveFilename("ai-cli", "zh")).toBe("ai-cli-zh.md");
    expect(resolveFilename("ai-agents", "fr")).toBe("ai-agents-fr.md");
    expect(resolveFilename("ai-trending", "ja")).toBe("ai-trending-ja.md");
  });
});

describe("resolveLabel", () => {
  it("returns base for English", () => {
    expect(resolveLabel("digest")).toBe("digest");
    expect(resolveLabel("digest", "en")).toBe("digest");
  });

  it("returns base-lang for non-English", () => {
    expect(resolveLabel("digest", "zh")).toBe("digest-zh");
    expect(resolveLabel("openclaw", "fr")).toBe("openclaw-fr");
    expect(resolveLabel("trending", "ja")).toBe("trending-ja");
  });
});

describe("autoGenFooter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty string when DIGEST_REPO is not set", () => {
    vi.stubEnv("DIGEST_REPO", "");
    expect(autoGenFooter()).toBe("");
  });

  it("returns English footer when DIGEST_REPO is set", () => {
    vi.stubEnv("DIGEST_REPO", "owner/repo");
    const result = autoGenFooter();
    expect(result).toContain("owner/repo");
    expect(result).toContain("Big Model Radar");
  });

  it("returns localized footer when locale provides one", () => {
    vi.stubEnv("DIGEST_REPO", "owner/repo");
    const result = autoGenFooter("zh");
    expect(result).toContain("由 Big Model Radar 自动生成");
  });
});
