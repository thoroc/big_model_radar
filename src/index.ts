/**
 * Big Model Radar: daily digest for AI CLI tools and OpenClaw.
 *
 * Env vars:
 *   OPENAI_API_KEY      - API key for an OpenAI-compatible endpoint
 *   OPENAI_BASE_URL     - Endpoint override (default: https://api.openai.com/v1)
 *   OPENAI_MODEL        - Model name (default: gpt-4.1-mini)
 *   ANTHROPIC_API_KEY   - Backward-compatible alias for OPENAI_API_KEY
 *   ANTHROPIC_BASE_URL  - Backward-compatible alias for OPENAI_BASE_URL
 *   ANTHROPIC_MODEL     - Backward-compatible alias for OPENAI_MODEL
 *   GITHUB_TOKEN        - GitHub token for API access and issue creation
 *   DIGEST_REPO         - owner/repo where digest issues are posted (optional)
 */

import {
  type RepoConfig,
  type GitHubItem,
  type GitHubRelease,
  fetchRecentItems,
  fetchRecentReleases,
  fetchSkillsData,
  createGitHubIssue,
} from "./github.ts";
import {
  type RepoDigest,
  buildCliPrompt,
  buildPeerPrompt,
  buildComparisonPrompt,
  buildPeersComparisonPrompt,
  buildSkillsPrompt,
  buildWebReportPrompt,
  buildTrendingPrompt,
  buildHnPrompt,
} from "./prompts.ts";
import { callLlm, saveFile, getLlmBaseUrl, hasLlmCredentials } from "./report.ts";
import { loadWebState, saveWebState, fetchSiteContent, type WebFetchResult, type WebState } from "./web.ts";
import { fetchTrendingData, type TrendingData } from "./trending.ts";
import { fetchHnData, type HnData } from "./hn.ts";
import { loadConfig, getEnabledLangs } from "./config.ts";
import { t, validateLocale } from "./strings.ts";
import { LANGUAGE_NAMES, resolveFilename, resolveLabel, autoGenFooter } from "./locale.ts";

// ---------------------------------------------------------------------------
// Repo config — loaded from config.yml, falls back to built-in defaults
// ---------------------------------------------------------------------------

const {
  cliRepos: CLI_REPOS,
  skillsRepo: CLAUDE_SKILLS_REPO,
  openclaw: OPENCLAW,
  openclawPeers: OPENCLAW_PEERS,
} = loadConfig();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RepoFetch {
  cfg: RepoConfig;
  issues: GitHubItem[];
  prs: GitHubItem[];
  releases: GitHubRelease[];
}

// ---------------------------------------------------------------------------
// Phase 1: Fetch
// ---------------------------------------------------------------------------

async function fetchAllData(
  since: Date,
  webState: WebState,
): Promise<{
  fetched: RepoFetch[];
  skillsData: { prs: GitHubItem[]; issues: GitHubItem[] };
  webResults: WebFetchResult[];
  trendingData: TrendingData;
  hnData: HnData;
}> {
  const allConfigs = [...CLI_REPOS, OPENCLAW, ...OPENCLAW_PEERS];
  console.log(`  Tracking: ${allConfigs.map((r) => r.id).join(", ")}, claude-code-skills, web, hn`);

  const [fetched, skillsData, webResults, trendingData, hnData] = await Promise.all([
    Promise.all(
      allConfigs.map(async (cfg) => {
        const [issuesRaw, prs, releases] = await Promise.all([
          fetchRecentItems(cfg, "issues", since),
          fetchRecentItems(cfg, "pulls", since),
          fetchRecentReleases(cfg.repo, since),
        ]);
        const issues = issuesRaw.filter((i) => !i.pull_request);
        console.log(
          `  [${cfg.id}] issues: ${issues.length}, prs: ${prs.length}, releases: ${releases.length}`,
        );
        return { cfg, issues, prs, releases };
      }),
    ),
    fetchSkillsData(CLAUDE_SKILLS_REPO).then((d) => {
      console.log(`  [claude-code-skills] prs: ${d.prs.length}, issues: ${d.issues.length}`);
      return d;
    }),
    Promise.all([
      fetchSiteContent("anthropic", webState).catch((err): WebFetchResult => {
        console.error(`  [web/anthropic] fetch failed: ${err}`);
        return {
          site: "anthropic",
          siteName: "Anthropic (Claude)",
          isFirstRun: false,
          newItems: [],
          totalDiscovered: 0,
        };
      }),
      fetchSiteContent("openai", webState).catch((err): WebFetchResult => {
        console.error(`  [web/openai] fetch failed: ${err}`);
        return { site: "openai", siteName: "OpenAI", isFirstRun: false, newItems: [], totalDiscovered: 0 };
      }),
    ]),
    fetchTrendingData().catch(
      (): TrendingData => ({
        trendingRepos: [],
        searchRepos: [],
        trendingFetchSuccess: false,
      }),
    ),
    fetchHnData().catch((): HnData => ({ stories: [], fetchSuccess: false })),
  ]);

  return { fetched, skillsData, webResults, trendingData, hnData };
}

// ---------------------------------------------------------------------------
// Phase 2: LLM summaries
// ---------------------------------------------------------------------------

async function generateSummaries(
  fetchedCli: RepoFetch[],
  fetchedOpenclaw: RepoFetch,
  skillsData: { prs: GitHubItem[]; issues: GitHubItem[] },
  fetchedPeers: RepoFetch[],
  trendingData: TrendingData,
  dateStr: string,
  lang = "en",
): Promise<{
  cliDigests: RepoDigest[];
  openclawSummary: string;
  skillsSummary: string;
  peerDigests: RepoDigest[];
  trendingSummary: string;
}> {
  const s = t(lang);
  const noActivity = s.noActivity;
  const summaryFailed = s.summaryFailed;
  const skillsFailed = s.skillsFailed;
  const trendingNoData = s.trendingNoData;
  const trendingFailed = s.trendingFailed;

  const [cliDigests, openclawSummary, skillsSummary, peerDigests, trendingSummary] = await Promise.all([
    Promise.all(
      fetchedCli.map(async ({ cfg, issues, prs, releases }): Promise<RepoDigest> => {
        const hasData = issues.length || prs.length || releases.length;
        if (!hasData) {
          console.log(`  [${cfg.id}] No activity, skipping LLM call`);
          return { config: cfg, issues, prs, releases, summary: noActivity };
        }
        console.log(`  [${cfg.id}] Calling LLM for summary...`);
        try {
          const summary = await callLlm(buildCliPrompt(cfg, issues, prs, releases, dateStr, lang));
          return { config: cfg, issues, prs, releases, summary };
        } catch (err) {
          console.error(`  [${cfg.id}] LLM call failed: ${err}`);
          return { config: cfg, issues, prs, releases, summary: summaryFailed };
        }
      }),
    ),
    (async () => {
      const { cfg, issues, prs, releases } = fetchedOpenclaw;
      const hasData = issues.length || prs.length || releases.length;
      if (!hasData) {
        console.log(`  [openclaw] No activity, skipping LLM call`);
        return noActivity;
      }
      console.log(`  [openclaw] Calling LLM for OpenClaw report...`);
      try {
        return await callLlm(buildPeerPrompt(cfg, issues, prs, releases, dateStr, lang, 50, 30));
      } catch (err) {
        console.error(`  [openclaw] LLM call failed: ${err}`);
        return summaryFailed;
      }
    })(),
    (async () => {
      console.log("  [claude-code-skills] Calling LLM for skills report...");
      try {
        return await callLlm(buildSkillsPrompt(skillsData.prs, skillsData.issues, dateStr, lang));
      } catch (err) {
        console.error(`  [claude-code-skills] LLM call failed: ${err}`);
        return skillsFailed;
      }
    })(),
    Promise.all(
      fetchedPeers.map(async ({ cfg, issues, prs, releases }): Promise<RepoDigest> => {
        const hasData = issues.length || prs.length || releases.length;
        if (!hasData) {
          console.log(`  [${cfg.id}] No activity, skipping LLM call`);
          return { config: cfg, issues, prs, releases, summary: noActivity };
        }
        console.log(`  [${cfg.id}] Calling LLM for peer summary...`);
        try {
          return {
            config: cfg,
            issues,
            prs,
            releases,
            summary: await callLlm(buildPeerPrompt(cfg, issues, prs, releases, dateStr, lang)),
          };
        } catch (err) {
          console.error(`  [${cfg.id}] LLM call failed: ${err}`);
          return { config: cfg, issues, prs, releases, summary: summaryFailed };
        }
      }),
    ),
    (async () => {
      const hasData = trendingData.trendingRepos.length > 0 || trendingData.searchRepos.length > 0;
      if (!hasData) return trendingNoData;
      console.log("  [trending] Calling LLM for trending report...");
      try {
        return await callLlm(buildTrendingPrompt(trendingData, dateStr, lang), 6144);
      } catch (err) {
        console.error(`  [trending] LLM call failed: ${err}`);
        return trendingFailed;
      }
    })(),
  ]);

  return { cliDigests, openclawSummary, skillsSummary, peerDigests, trendingSummary };
}

// ---------------------------------------------------------------------------
// Report content builders
// ---------------------------------------------------------------------------

export function buildCliReportContent(
  cliDigests: RepoDigest[],
  skillsSummary: string,
  comparison: string,
  utcStr: string,
  dateStr: string,
  footer: string,
  lang = "en",
): string {
  const s = t(lang);
  const repoLinks =
    cliDigests.map((d) => `- [${d.config.name}](https://github.com/${d.config.repo})`).join("\n") +
    `\n- [Claude Code Skills](https://github.com/${CLAUDE_SKILLS_REPO})`;

  const skillsSection =
    s.cliSkillsHeading +
    `\n\n` +
    s.cliSkillsSource.replace("{repo}", CLAUDE_SKILLS_REPO) +
    `\n\n` +
    `${skillsSummary}\n\n---\n\n`;

  const toolSections = cliDigests
    .map((d) => {
      const skills = d.config.id === "claude-code" ? skillsSection : "";
      return [
        `<details>`,
        `<summary><strong>${d.config.name}</strong> — <a href="https://github.com/${d.config.repo}">${d.config.repo}</a></summary>`,
        ``,
        skills + d.summary,
        ``,
        `</details>`,
      ].join("\n");
    })
    .join("\n\n");

  return (
    `# ${s.cliTitle} ${dateStr}\n\n` +
    s.cliMeta.replace("{utcStr}", utcStr).replace("{count}", String(cliDigests.length)) +
    `\n\n` +
    `${repoLinks}\n\n` +
    `---\n\n` +
    s.cliComparison +
    `\n\n` +
    comparison +
    `\n\n---\n\n` +
    s.cliDetail +
    `\n\n` +
    toolSections +
    footer
  );
}

export function buildOpenclawReportContent(
  fetchedOpenclaw: RepoFetch,
  peerDigests: RepoDigest[],
  openclawSummary: string,
  peersComparison: string,
  utcStr: string,
  dateStr: string,
  footer: string,
  lang = "en",
): string {
  const s = t(lang);
  const { issues, prs } = fetchedOpenclaw;

  const peersRepoLinks =
    `- [OpenClaw](https://github.com/${OPENCLAW.repo})\n` +
    OPENCLAW_PEERS.map((p) => `- [${p.name}](https://github.com/${p.repo})`).join("\n");

  const peerDetailSections = peerDigests
    .map((d) =>
      [
        `<details>`,
        `<summary><strong>${d.config.name}</strong> — <a href="https://github.com/${d.config.repo}">${d.config.repo}</a></summary>`,
        ``,
        d.summary,
        ``,
        `</details>`,
      ].join("\n"),
    )
    .join("\n\n");

  return (
    `# ${s.openclawTitle} ${dateStr}\n\n` +
    s.openclawMeta
      .replace("{issues}", String(issues.length))
      .replace("{prs}", String(prs.length))
      .replace("{projects}", String(1 + OPENCLAW_PEERS.length))
      .replace("{utcStr}", utcStr) +
    `\n\n` +
    `${peersRepoLinks}\n\n` +
    `---\n\n` +
    s.openclawDeepDive +
    `\n\n` +
    openclawSummary +
    `\n\n---\n\n` +
    s.openclawComparison +
    `\n\n` +
    peersComparison +
    `\n\n---\n\n` +
    s.openclawPeers +
    `\n\n` +
    peerDetailSections +
    footer
  );
}

// ---------------------------------------------------------------------------
// Report savers (LLM call + file save + optional GitHub issue)
// ---------------------------------------------------------------------------

async function saveWebReport(
  webResults: WebFetchResult[],
  webState: WebState,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
  footer: string,
  lang = "en",
): Promise<void> {
  const s = t(lang);
  const hasNewContent = webResults.some((r) => r.newItems.length > 0);

  if (hasNewContent) {
    console.log(`  [web] Calling LLM for web content report...`);
    try {
      const webSummary = await callLlm(buildWebReportPrompt(webResults, dateStr, lang), 8192);
      const isFirstRun = webResults.some((r) => r.isFirstRun);
      const totalNew = webResults.reduce((sum, r) => sum + r.newItems.length, 0);

      const anthropicNew = webResults.find((r) => r.site === "anthropic")?.newItems.length ?? 0;
      const anthropicTotal = webResults.find((r) => r.site === "anthropic")?.totalDiscovered ?? 0;
      const openaiNew = webResults.find((r) => r.site === "openai")?.newItems.length ?? 0;
      const openaiTotal = webResults.find((r) => r.site === "openai")?.totalDiscovered ?? 0;

      const mode = isFirstRun ? "First full crawl" : "Today's update";
      const webContent =
        `# ${s.webTitle} ${dateStr}\n\n` +
        s.webMeta.replace("{mode}", mode).replace("{count}", String(totalNew)).replace("{utcStr}", utcStr) +
        `\n\n` +
        s.webSources +
        `\n` +
        `- Anthropic: [anthropic.com](https://www.anthropic.com) — ${anthropicNew} new articles (sitemap total: ${anthropicTotal})\n` +
        `- OpenAI: [openai.com](https://openai.com) — ${openaiNew} new articles (sitemap total: ${openaiTotal})\n\n` +
        `---\n\n` +
        webSummary +
        footer;

      console.log(`  Saved ${saveFile(webContent, dateStr, resolveFilename("ai-web", lang))}`);

      if (digestRepo) {
        const webIssueTitle = `${s.issueWebTitle} ${dateStr}${isFirstRun ? " (First Crawl)" : ""}`;
        const webUrl = await createGitHubIssue(
          webIssueTitle,
          webContent,
          resolveLabel(s.issueLabelWeb, lang),
          lang,
        );
        console.log(`  Created web issue: ${webUrl}`);
      }
    } catch (err) {
      console.error(`  [web] Report generation failed: ${err}`);
    }
  } else {
    console.log(`  [web] No new content detected, skipping report.`);
  }

  saveWebState(webState);
  console.log("  [web] State saved.");
}

async function saveTrendingReport(
  trendingData: TrendingData,
  trendingSummary: string,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
  footer: string,
  lang = "en",
): Promise<void> {
  const s = t(lang);
  const hasData = trendingData.trendingRepos.length > 0 || trendingData.searchRepos.length > 0;
  if (!hasData) {
    console.log(`  [trending] No data available, skipping report.`);
    return;
  }

  const trendingContent =
    `# ${s.trendingTitle} ${dateStr}\n\n` +
    s.trendingMeta.replace("{utcStr}", utcStr) +
    `\n\n---\n\n` +
    trendingSummary +
    footer;

  console.log(`  Saved ${saveFile(trendingContent, dateStr, resolveFilename("ai-trending", lang))}`);

  if (digestRepo) {
    const trendingUrl = await createGitHubIssue(
      `${s.issueTrendingTitle} ${dateStr}`,
      trendingContent,
      resolveLabel(s.issueLabelTrending, lang),
      lang,
    );
    console.log(`  Created trending issue: ${trendingUrl}`);
  }
}

async function saveHnReport(
  hnData: HnData,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
  footer: string,
  lang = "en",
): Promise<void> {
  const s = t(lang);
  if (!hnData.fetchSuccess) {
    console.log(`  [hn] No data available, skipping report.`);
    return;
  }

  console.log(`  [hn] Calling LLM for HN report...`);
  try {
    const hnSummary = await callLlm(buildHnPrompt(hnData, dateStr, lang));
    const hnContent =
      `# ${s.hnTitle} ${dateStr}\n\n` +
      s.hnMeta.replace("{count}", String(hnData.stories.length)).replace("{utcStr}", utcStr) +
      `\n\n` +
      `---\n\n` +
      hnSummary +
      footer;

    console.log(`  Saved ${saveFile(hnContent, dateStr, resolveFilename("ai-hn", lang))}`);

    if (digestRepo) {
      const hnUrl = await createGitHubIssue(
        `${s.issueHnTitle} ${dateStr}`,
        hnContent,
        resolveLabel(s.issueLabelHn, lang),
        lang,
      );
      console.log(`  Created HN issue: ${hnUrl}`);
    }
  } catch (err) {
    console.error(`  [hn] Report generation failed: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  requireEnv("GITHUB_TOKEN");
  if (!hasLlmCredentials()) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY");
  }

  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const utcStr = now.toISOString().slice(0, 16).replace("T", " ");
  const digestRepo = process.env["DIGEST_REPO"] ?? "";

  console.log(`[${now.toISOString()}] Starting digest | endpoint: ${getLlmBaseUrl()}`);

  // 1. Fetch all data in parallel (language-independent, once)
  const webState = loadWebState();
  const { fetched, skillsData, webResults, trendingData, hnData } = await fetchAllData(since, webState);

  const peerIds = new Set(OPENCLAW_PEERS.map((p) => p.id));
  const fetchedCli = fetched.filter((f) => f.cfg.id !== OPENCLAW.id && !peerIds.has(f.cfg.id));
  const fetchedOpenclaw = fetched.find((f) => f.cfg.id === OPENCLAW.id)!;
  const fetchedPeers = fetched.filter((f) => peerIds.has(f.cfg.id));

  const footer = autoGenFooter();

  // 2. Iterate over enabled languages
  const enabledLangs = getEnabledLangs();

  for (const rawLang of enabledLangs) {
    const lang = validateLocale(rawLang);
    const langName = LANGUAGE_NAMES[lang] ?? lang;
    console.log(`\n[${lang}] Generating ${langName} report...`);

    // Generate per-repo LLM summaries for this language
    const summaries = await generateSummaries(
      fetchedCli,
      fetchedOpenclaw,
      skillsData,
      fetchedPeers,
      trendingData,
      dateStr,
      lang,
    );

    // Generate cross-repo comparisons for this language
    const openclawDigest: RepoDigest = {
      config: OPENCLAW,
      issues: fetchedOpenclaw.issues,
      prs: fetchedOpenclaw.prs,
      releases: fetchedOpenclaw.releases,
      summary: summaries.openclawSummary,
    };
    const [comparison, peersComparison] = await Promise.all([
      callLlm(buildComparisonPrompt(summaries.cliDigests, dateStr, lang)),
      callLlm(buildPeersComparisonPrompt(openclawDigest, summaries.peerDigests, dateStr, lang)),
    ]);

    // Build reports for this language
    const digestContent = buildCliReportContent(
      summaries.cliDigests,
      summaries.skillsSummary,
      comparison,
      utcStr,
      dateStr,
      footer,
      lang,
    );
    const openclawContent = buildOpenclawReportContent(
      fetchedOpenclaw,
      summaries.peerDigests,
      summaries.openclawSummary,
      peersComparison,
      utcStr,
      dateStr,
      footer,
      lang,
    );

    // Save with locale-suffixed filenames
    console.log(`  Saved ${saveFile(digestContent, dateStr, resolveFilename("ai-cli", lang))}`);
    console.log(`  Saved ${saveFile(openclawContent, dateStr, resolveFilename("ai-agents", lang))}`);

    // Create GitHub issues with locale-appropriate labels
    if (digestRepo) {
      const s = t(lang);
      const cliUrl = await createGitHubIssue(
        `${s.issueCliTitle} ${dateStr}`,
        digestContent,
        resolveLabel(s.issueLabelDigest, lang),
        lang,
      );
      console.log(`  Created CLI issue: ${cliUrl}`);
      const openclawUrl = await createGitHubIssue(
        `${s.issueOpenclawTitle} ${dateStr}`,
        openclawContent,
        resolveLabel(s.issueLabelOpenclaw, lang),
        lang,
      );
      console.log(`  Created OpenClaw issue: ${openclawUrl}`);
    }

    // Save web, trending, and HN reports for this language
    await saveWebReport(webResults, webState, utcStr, dateStr, digestRepo, footer, lang);
    await saveTrendingReport(
      trendingData,
      summaries.trendingSummary,
      utcStr,
      dateStr,
      digestRepo,
      footer,
      lang,
    );
    await saveHnReport(hnData, utcStr, dateStr, digestRepo, footer, lang);
  }

  console.log("Done!");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
