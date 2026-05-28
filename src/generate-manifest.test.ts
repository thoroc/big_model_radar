import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("node:fs", () => ({
  default: {
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(),
    existsSync: vi.fn(() => false),
    writeFileSync: vi.fn(),
  },
  readdirSync: vi.fn(() => []),
  statSync: vi.fn(),
  existsSync: vi.fn(() => false),
  writeFileSync: vi.fn(),
}));

vi.mock("fs", () => ({
  default: {
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(),
    existsSync: vi.fn(() => false),
    writeFileSync: vi.fn(),
  },
  readdirSync: vi.fn(() => []),
  statSync: vi.fn(),
  existsSync: vi.fn(() => false),
  writeFileSync: vi.fn(),
}));

describe("generate-manifest", () => {
  let REPORT_FILES: readonly string[];
  let REPORT_LABELS: Record<string, string>;

  beforeAll(async () => {
    vi.stubEnv("PAGES_URL", "https://example.github.io/repo");
    const mod = await import("./generate-manifest");
    REPORT_FILES = mod.REPORT_FILES;
    REPORT_LABELS = mod.REPORT_LABELS;
  });

  describe("REPORT_FILES", () => {
    it("has all expected report file entries", () => {
      expect(REPORT_FILES).toContain("ai-cli");
      expect(REPORT_FILES).toContain("ai-agents");
      expect(REPORT_FILES).toContain("ai-web");
      expect(REPORT_FILES).toContain("ai-trending");
      expect(REPORT_FILES).toContain("ai-hn");
      expect(REPORT_FILES).toContain("ai-weekly");
      expect(REPORT_FILES).toContain("ai-monthly");
    });

    it("has correct number of entries", () => {
      expect(REPORT_FILES).toHaveLength(7);
    });
  });

  describe("REPORT_LABELS", () => {
    it("has entries for every file in REPORT_FILES", () => {
      REPORT_FILES.forEach((r) => {
        expect(REPORT_LABELS).toHaveProperty(r);
      });
    });

    it("all labels are non-empty strings", () => {
      Object.values(REPORT_LABELS).forEach((label) => {
        expect(typeof label).toBe("string");
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });
});
