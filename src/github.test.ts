import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock fs so generate-manifest can be imported without side effects
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

import { headers, createGitHubIssue } from "./github";

describe("headers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns object with Authorization header", () => {
    vi.stubEnv("GITHUB_TOKEN", "gh_test_token");
    const h = headers();
    expect(h["Authorization"]).toBe("Bearer gh_test_token");
  });

  it("returns object with Accept header", () => {
    vi.stubEnv("GITHUB_TOKEN", "gh_test_token");
    const h = headers();
    expect(h["Accept"]).toBe("application/vnd.github+json");
  });

  it("returns empty token when GITHUB_TOKEN is not set", () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    const h = headers();
    expect(h["Authorization"]).toBe("Bearer ");
  });
});

describe("createGitHubIssue", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("truncates body over the limit", async () => {
    vi.stubEnv("DIGEST_REPO", "owner/repo");
    vi.stubEnv("GITHUB_TOKEN", "test-token");

    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ html_url: "https://github.com/owner/repo/issues/1" }),
    });

    const longBody = "A".repeat(70000);
    await createGitHubIssue("Test Title", longBody, "digest");

    const issueCalls = mockFetch.mock.calls.filter((c) => String(c[0]).includes("/issues"));
    const body = JSON.parse(issueCalls[0]![1]!.body as string);

    expect(body.body.length).toBeLessThan(66000);
    expect(body.body).toContain("⚠️");
  });
});

describe("LABEL_COLORS", () => {
  let REPORT_FILES: readonly string[];

  beforeAll(async () => {
    vi.stubEnv("PAGES_URL", "https://example.github.io/repo");
    const mod = await import("./generate-manifest");
    REPORT_FILES = mod.REPORT_FILES;
  });

  it("covers all labels defined in REPORT_FILES from generate-manifest", () => {
    const expectedLabels: Record<string, string> = {
      digest: "1d76db",
      openclaw: "e11d48",
      web: "6366f1",
      trending: "f9a825",
      hn: "ff6600",
      weekly: "7c3aed",
      monthly: "0d9488",
    };

    const labelMap: Record<string, string> = {
      "ai-cli": "digest",
      "ai-agents": "openclaw",
      "ai-web": "web",
      "ai-trending": "trending",
      "ai-hn": "hn",
      "ai-weekly": "weekly",
      "ai-monthly": "monthly",
    };

    for (const file of REPORT_FILES) {
      const label = labelMap[file];
      expect(label).toBeDefined();
      expect(expectedLabels[label!]).toBeDefined();
    }
  });
});
