import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs", () => {
  const mockFs = {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return {
    default: mockFs,
    ...mockFs,
  };
});

vi.mock("fs", () => {
  const mockFs = {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return {
    default: mockFs,
    ...mockFs,
  };
});

import fs from "node:fs";
import { getDateDirs, readDailyDigest, readWeeklyDigest, toWeekStr } from "./rollup";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReaddirSync = () => vi.mocked(fs.readdirSync) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockStatSync = () => vi.mocked(fs.statSync) as any;

describe("getDateDirs", () => {
  it("returns empty array when digests directory doesn't exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(getDateDirs()).toEqual([]);
  });

  it("returns array of date strings sorted reverse", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    mockReaddirSync().mockReturnValue(["2026-05-28", "2026-05-27", "2026-05-26"]);
    mockStatSync().mockReturnValue({ isDirectory: () => true });

    const result = getDateDirs();
    expect(result).toEqual(["2026-05-28", "2026-05-27", "2026-05-26"]);
  });

  it("filters out non-date directories", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    mockReaddirSync().mockReturnValue(["2026-05-28", "not-a-date", ".hidden"]);
    mockStatSync().mockReturnValue({ isDirectory: () => true });

    const result = getDateDirs();
    expect(result).toEqual(["2026-05-28"]);
  });
});

describe("readDailyDigest", () => {
  it("returns null when no digest file exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(readDailyDigest("2026-05-28")).toBeNull();
  });

  it("returns truncated content", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("Short content");

    const result = readDailyDigest("2026-05-28");
    expect(result).toBe("Short content");
  });

  it("truncates content at the limit", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const longContent = "A".repeat(3000);
    vi.mocked(fs.readFileSync).mockReturnValue(longContent);

    const result = readDailyDigest("2026-05-28");
    expect(result).toContain("[truncated]");
    expect(result!.length).toBeLessThan(longContent.length + 20);
  });
});

describe("readWeeklyDigest", () => {
  it("returns null when weekly digest doesn't exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(readWeeklyDigest("2026-05-28")).toBeNull();
  });

  it("returns truncated content", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("Weekly content");

    const result = readWeeklyDigest("2026-05-28");
    expect(result).toContain("Weekly content");
  });
});

describe("toWeekStr", () => {
  it("returns correct ISO week string", () => {
    const date = new Date("2026-05-28T12:00:00Z");
    const result = toWeekStr(date);
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("handles date at year boundary", () => {
    const date = new Date("2026-01-01T12:00:00Z");
    const result = toWeekStr(date);
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });
});
