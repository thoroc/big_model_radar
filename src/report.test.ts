import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("node:fs", () => {
  const mockFs = {
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return {
    default: mockFs,
    ...mockFs,
  };
});

import fs from "node:fs";
import { autoGenFooter, hasLlmCredentials, saveFile } from "./report";

describe("autoGenFooter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty string when DIGEST_REPO is not set", () => {
    vi.stubEnv("DIGEST_REPO", "");

    const result = autoGenFooter();

    expect(result).toBe("");
  });

  it("returns correct footer with repo URL when DIGEST_REPO is set", () => {
    vi.stubEnv("DIGEST_REPO", "owner/repo");

    const result = autoGenFooter();

    expect(result).toContain("owner/repo");
    expect(result).toContain("Big Model Radar");
  });
});

describe("hasLlmCredentials", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when no API key", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");

    expect(hasLlmCredentials()).toBe(false);
  });

  it("returns true when ANTHROPIC_API_KEY is set", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");

    expect(hasLlmCredentials()).toBe(true);
  });

  it("returns true when OPENAI_API_KEY is set", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    vi.stubEnv("ANTHROPIC_API_KEY", "");

    expect(hasLlmCredentials()).toBe(true);
  });
});

describe("saveFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates directory and writes content correctly", () => {
    vi.mocked(fs.mkdirSync).mockReturnThis();
    vi.mocked(fs.writeFileSync).mockReturnThis();

    const result = saveFile("test content", "2026-05-28", "test-report.md");

    expect(result).toContain("digests");
    expect(result).toContain("2026-05-28");
    expect(result).toContain("test-report.md");
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
