import { describe, it, expect, vi } from "vitest";

vi.mock("./config", () => ({
  loadConfig: () => ({
    cliRepos: [{ id: "test-cli", repo: "test/cli", name: "Test CLI" }],
    skillsRepo: "test/skills",
    openclaw: { id: "test-openclaw", repo: "test/openclaw", name: "Test OpenClaw" },
    openclawPeers: [{ id: "test-peer", repo: "test/peer", name: "Test Peer" }],
  }),
}));

import { buildCliReportContent, buildOpenclawReportContent } from "./index";
import type { RepoDigest } from "./prompts";

const makeDigest = (overrides: Partial<RepoDigest> = {}): RepoDigest => ({
  config: { id: "test", repo: "test/repo", name: "Test" },
  issues: [],
  prs: [],
  releases: [],
  summary: "Test summary content.",
  ...overrides,
});

describe("buildCliReportContent", () => {
  it("returns markdown string with correct structure", () => {
    const result = buildCliReportContent(
      [makeDigest()],
      "Skills summary.",
      "Comparison text.",
      "2026-05-28 12:00",
      "2026-05-28",
      "\n\n---\n*Footer.*",
    );

    expect(result).toContain("# AI CLI Tools Community Digest");
    expect(result).toContain("2026-05-28");
    expect(result).toContain("Cross-Tool Comparison");
    expect(result).toContain("Per-Tool Reports");
    expect(result).toContain("Comparison text.");
    expect(result).toContain("Footer.");
  });

  it("contains expected sections", () => {
    const result = buildCliReportContent(
      [makeDigest()],
      "Skills summary.",
      "Comparison text.",
      "2026-05-28 12:00",
      "2026-05-28",
      "",
    );

    expect(result).toMatch(/AI CLI Tools Community Digest/);
    expect(result).toMatch(/Cross-Tool Comparison/);
    expect(result).toMatch(/Per-Tool Reports/);
    expect(result).toMatch(/Test/);
  });

  it("includes skills section for claude-code", () => {
    const result = buildCliReportContent(
      [makeDigest({ config: { id: "claude-code", repo: "anthropics/claude-code", name: "Claude Code" } })],
      "Skills summary here.",
      "Comparison.",
      "2026-05-28 12:00",
      "2026-05-28",
      "",
    );

    expect(result).toContain("Claude Code Skills Highlights");
    expect(result).toContain("Skills summary here.");
  });
});

describe("buildOpenclawReportContent", () => {
  it("returns markdown string with correct structure", () => {
    const fetchedOpenclaw = {
      cfg: { id: "openclaw", repo: "test/openclaw", name: "OpenClaw Test" },
      issues: [],
      prs: [],
      releases: [],
    };

    const result = buildOpenclawReportContent(
      fetchedOpenclaw,
      [makeDigest()],
      "OpenClaw summary.",
      "Cross comparison.",
      "2026-05-28 12:00",
      "2026-05-28",
      "\n\n---\n*Footer.*",
    );

    expect(result).toContain("# OpenClaw Ecosystem Digest");
    expect(result).toContain("2026-05-28");
    expect(result).toContain("OpenClaw Deep Dive");
    expect(result).toContain("Cross-Ecosystem Comparison");
    expect(result).toContain("Peer Project Reports");
    expect(result).toContain("Cross comparison.");
    expect(result).toContain("Footer.");
  });

  it("contains expected sections", () => {
    const fetchedOpenclaw = {
      cfg: { id: "openclaw", repo: "test/openclaw", name: "OpenClaw Test" },
      issues: [],
      prs: [],
      releases: [],
    };

    const result = buildOpenclawReportContent(
      fetchedOpenclaw,
      [makeDigest()],
      "OpenClaw summary.",
      "Cross comparison.",
      "2026-05-28 12:00",
      "2026-05-28",
      "",
    );

    expect(result).toMatch(/OpenClaw Ecosystem Digest/);
    expect(result).toMatch(/OpenClaw Deep Dive/);
    expect(result).toMatch(/Cross-Ecosystem Comparison/);
    expect(result).toMatch(/Peer Project Reports/);
  });

  it("includes issue and PR counts in header", () => {
    const fetchedOpenclaw = {
      cfg: { id: "openclaw", repo: "test/openclaw", name: "OpenClaw Test" },
      issues: [],
      prs: [],
      releases: [],
    };

    const result = buildOpenclawReportContent(
      fetchedOpenclaw,
      [makeDigest()],
      "Summary.",
      "Comparison.",
      "2026-05-28 12:00",
      "2026-05-28",
      "",
    );

    expect(result).toContain("Issues: 0");
    expect(result).toContain("PRs: 0");
    expect(result).toContain("Projects covered: 2");
  });
});
