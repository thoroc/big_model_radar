import { describe, it, expect, vi, beforeAll } from "vitest";

describe("buildMessage", () => {
  let buildMessage: (date: string, reports: string[]) => string;

  beforeAll(async () => {
    vi.stubEnv("PAGES_URL", "https://example.github.io/repo");
    const mod = await import("./notify");
    buildMessage = mod.buildMessage;
  });

  it("returns message with correct header", () => {
    const msg = buildMessage("2026-05-28", ["ai-cli"]);
    expect(msg).toContain("Big Model Radar");
    expect(msg).toContain("2026-05-28");
    expect(msg).toContain("<b>");
  });

  it("includes links for reports", () => {
    const msg = buildMessage("2026-05-28", ["ai-cli", "ai-agents"]);
    expect(msg).toContain("AI CLI Tools");
    expect(msg).toContain("AI Agents Ecosystem");
    expect(msg).toContain("https://example.github.io/repo");
    expect(msg).toContain("Web UI");
    expect(msg).toContain("RSS");
  });

  it("handles empty reports array", () => {
    const msg = buildMessage("2026-05-28", []);
    expect(msg).toContain("Big Model Radar");
  });

  it("identifies weekly reports", () => {
    const msg = buildMessage("2026-05-28", ["ai-weekly"]);
    expect(msg).toContain("AI Tools Weekly");
    expect(msg).toContain("📅");
  });
});
