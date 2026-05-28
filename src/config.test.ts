import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs", () => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  };
  return {
    default: mockFs,
    ...mockFs,
  };
});

vi.mock("js-yaml", () => {
  const mockYaml = {
    load: vi.fn(),
  };
  return {
    default: mockYaml,
    ...mockYaml,
  };
});

import fs from "node:fs";
import yaml from "js-yaml";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns default config when config file doesn't exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const config = loadConfig();

    expect(config.cliRepos).toHaveLength(7);
    expect(config.skillsRepo).toBe("anthropics/skills");
    expect(config.openclaw.id).toBe("openclaw");
    expect(config.openclawPeers).toHaveLength(10);
  });

  it("parses YAML correctly when config file exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));
    vi.mocked(yaml.load).mockReturnValue({
      cli_repos: [{ id: "custom", repo: "custom/repo", name: "Custom Repo" }],
    });

    const config = loadConfig("custom.yml");

    expect(config.cliRepos).toHaveLength(1);
    expect(config.cliRepos[0]!.id).toBe("custom");
    expect(config.cliRepos[0]!.name).toBe("Custom Repo");
  });

  it("falls back to defaults when config has partial fields", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));
    vi.mocked(yaml.load).mockReturnValue({ cli_repos: [], openclaw_peers: [] });

    const config = loadConfig();

    expect(config.cliRepos).toHaveLength(7);
    expect(config.skillsRepo).toBe("anthropics/skills");
    expect(config.openclawPeers).toHaveLength(10);
  });

  it("handles cli_repos override", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));
    vi.mocked(yaml.load).mockReturnValue({
      cli_repos: [{ id: "override-cli", repo: "override/repo", name: "Override CLI" }],
    });

    const config = loadConfig();

    expect(config.cliRepos).toHaveLength(1);
    expect(config.cliRepos[0]!.id).toBe("override-cli");
  });

  it("handles openclaw_peers override", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));
    vi.mocked(yaml.load).mockReturnValue({
      openclaw_peers: [{ id: "override-peer", repo: "override/peer", name: "Override Peer" }],
    });

    const config = loadConfig();

    expect(config.openclawPeers).toHaveLength(1);
    expect(config.openclawPeers[0]!.id).toBe("override-peer");
  });

  it("returns defaults when config has null fields", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const config = loadConfig();

    expect(config.cliRepos).toHaveLength(7);
    expect(config.skillsRepo).toBe("anthropics/skills");
    expect(config.openclaw.id).toBe("openclaw");
    expect(config.openclawPeers).toHaveLength(10);
  });
});
