import { describe, it, expect } from "vitest";
import { formatItem, sampleNote, topN } from "./prompts";
import type { GitHubItem } from "./github";

const makeItem = (overrides: Partial<GitHubItem> = {}): GitHubItem => ({
  number: 1,
  title: "Test Issue",
  state: "open",
  user: { login: "testuser" },
  labels: [{ name: "bug" }, { name: "enhancement" }],
  created_at: "2026-05-28T00:00:00Z",
  updated_at: "2026-05-28T12:00:00Z",
  comments: 5,
  reactions: { "+1": 3 },
  body: "This is a test body",
  html_url: "https://github.com/owner/repo/issues/1",
  pull_request: undefined,
  ...overrides,
});

describe("formatItem", () => {
  it("formats a complete GitHubItem with all fields", () => {
    const item = makeItem();
    const result = formatItem(item);

    expect(result).toContain("#1");
    expect(result).toContain("[OPEN]");
    expect(result).toContain("bug, enhancement");
    expect(result).toContain("Test Issue");
    expect(result).toContain("testuser");
    expect(result).toContain("2026-05-28");
    expect(result).toContain("Comments: 5");
    expect(result).toContain("This is a test body");
  });

  it("handles missing optional fields (null body, null comments)", () => {
    const item = makeItem({ body: null, reactions: undefined });
    const result = formatItem(item);

    expect(result).toContain("#1");
    expect(result).toContain("👍: 0");
  });

  it("truncates body at 300 characters", () => {
    const longBody = "x".repeat(500);
    const item = makeItem({ body: longBody });
    const result = formatItem(item);

    expect(result).toContain("x".repeat(300));
    expect(result).toContain("...");
    expect(result.length).toBeLessThan(600);
  });
});

describe("sampleNote", () => {
  it("returns correct string when total > sampled", () => {
    expect(sampleNote(50, 30)).toBe("(Total: 50 items; showing top 30 by comment count)");
  });

  it("returns correct string when total == sampled", () => {
    expect(sampleNote(30, 30)).toBe("(Total: 30 items)");
  });

  it("returns correct string when sampled is 0", () => {
    expect(sampleNote(0, 0)).toBe("(Total: 0 items)");
  });
});

describe("topN", () => {
  it("returns first n items sorted by comments descending", () => {
    const items = [
      makeItem({ number: 1, comments: 1 }),
      makeItem({ number: 2, comments: 10 }),
      makeItem({ number: 3, comments: 5 }),
    ];

    const result = topN(items, 2);

    expect(result).toHaveLength(2);
    expect(result[0]!.number).toBe(2);
    expect(result[1]!.number).toBe(3);
  });

  it("returns all items when n >= items.length", () => {
    const items = [makeItem({ number: 1, comments: 5 }), makeItem({ number: 2, comments: 3 })];

    expect(topN(items, 5)).toHaveLength(2);
    expect(topN(items, 2)).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(topN([], 5)).toEqual([]);
  });
});
