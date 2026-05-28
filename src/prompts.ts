/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease } from "./github.ts";
import type { WebFetchResult } from "./web.ts";
import type { TrendingData } from "./trending.ts";
import type { HnData } from "./hn.ts";
import { t } from "./strings.ts";
import { LANGUAGE_NAMES } from "./locale.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoDigest {
  config: RepoConfig;
  issues: GitHubItem[];
  prs: GitHubItem[];
  releases: GitHubRelease[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatItem(item: GitHubItem, lang = "en"): string {
  const s = t(lang);
  const labels = item.labels.map((l) => l.name).join(", ");
  const labelStr = labels ? ` [${labels}]` : "";
  const body = (item.body ?? "").replace(/\n/g, " ").trim().slice(0, 300);
  const ellipsis = (item.body ?? "").length > 300 ? "..." : "";
  return [
    `#${item.number} [${item.state.toUpperCase()}]${labelStr} ${item.title}`,
    `  ${s.formatItemAuthor}: @${item.user.login} | ${s.formatItemCreated}: ${item.created_at.slice(0, 10)} | ${s.formatItemUpdated}: ${item.updated_at.slice(0, 10)} | ${s.formatItemComments}: ${item.comments} | 👍: ${item.reactions?.["+1"] ?? 0}`,
    `  ${s.formatItemUrl}: ${item.html_url}`,
    `  ${s.formatItemSummary}: ${body}${ellipsis}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Sampling helpers (shared)
// ---------------------------------------------------------------------------

const CLI_ISSUE_LIMIT = 30;
const CLI_PR_LIMIT = 20;

/** Sort by comment count desc, take top N. */
export function topN(items: GitHubItem[], n: number): GitHubItem[] {
  return [...items].sort((a, b) => b.comments - a.comments).slice(0, n);
}

export function sampleNote(total: number, sampled: number, lang = "en"): string {
  const s = t(lang);
  return total > sampled
    ? s.sampleNote.replace("{total}", String(total)).replace("{sampled}", String(sampled))
    : `(Total: ${total} items)`;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export function buildCliPrompt(
  cfg: RepoConfig,
  issues: GitHubItem[],
  prs: GitHubItem[],
  releases: GitHubRelease[],
  dateStr: string,
  lang = "en",
): string {
  const sampledIssues = topN(issues, CLI_ISSUE_LIMIT);
  const sampledPrs = topN(prs, CLI_PR_LIMIT);

  const issuesText = sampledIssues.map((i) => formatItem(i, lang)).join("\n") || t(lang).noneStr;
  const prsText = sampledPrs.map((p) => formatItem(p, lang)).join("\n") || t(lang).noneStr;
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : t(lang).noneStr;

  const issueNote = sampleNote(issues.length, sampledIssues.length, lang);
  const prNote = sampleNote(prs.length, sampledPrs.length, lang);

  return `You are a technical analyst focused on AI developer tools. Based on the following GitHub data, generate the ${cfg.name} community digest for ${dateStr}.

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

# Data source: github.com/${cfg.repo}

## Latest Releases (last 24h)
${releasesText}

## Latest Issues (updated in last 24h)${issueNote}
${issuesText}

## Latest Pull Requests (updated in last 24h)${prNote}
${prsText}

---

Generate a structured ${LANGUAGE_NAMES[lang]} digest with the following sections:

1. **Today's Highlights** - 2-3 sentences summarizing the most important updates
2. **Releases** - If new versions exist, summarize changes; omit if none
3. **Hot Issues** - Pick 10 noteworthy Issues, explain why they matter and community reaction
4. **Key PR Progress** - Pick 10 important PRs, describe features or fixes
5. **Feature Request Trends** - Distill the most-requested feature directions from all Issues
6. **Developer Pain Points** - Summarize recurring developer frustrations or high-frequency requests

Style: concise and professional, suited for technical developers. Include GitHub links for each item.
`;
}

const PEER_ISSUE_LIMIT = 30;
const PEER_PR_LIMIT = 20;

export function buildPeerPrompt(
  cfg: RepoConfig,
  issues: GitHubItem[],
  prs: GitHubItem[],
  releases: GitHubRelease[],
  dateStr: string,
  lang = "en",
  issueLimit = PEER_ISSUE_LIMIT,
  prLimit = PEER_PR_LIMIT,
): string {
  const totalIssues = issues.length;
  const totalPrs = prs.length;

  const sampledIssues = topN(issues, issueLimit);
  const sampledPrs = topN(prs, prLimit);

  const issuesText = sampledIssues.map((i) => formatItem(i, lang)).join("\n") || t(lang).noneStr;
  const prsText = sampledPrs.map((p) => formatItem(p, lang)).join("\n") || t(lang).noneStr;
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : t(lang).noneStr;

  const openIssues = issues.filter((i) => i.state === "open").length;
  const closedIssues = issues.filter((i) => i.state === "closed").length;
  const openPrs = prs.filter((p) => p.state === "open").length;
  const mergedPrs = prs.filter((p) => p.state === "closed").length;

  const issueSampleNote = sampleNote(totalIssues, sampledIssues.length, lang);
  const prSampleNote = sampleNote(totalPrs, sampledPrs.length, lang);

  return `You are an analyst of AI agent and personal AI assistant open-source projects. Based on the following GitHub data from ${cfg.name} (github.com/${cfg.repo}), generate a project digest for ${dateStr}.

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

# Data Overview
- Issues updated in last 24h: ${totalIssues} (open/active: ${openIssues}, closed: ${closedIssues})
- PRs updated in last 24h: ${totalPrs} (open: ${openPrs}, merged/closed: ${mergedPrs})
- New releases: ${releases.length}

## Latest Releases
${releasesText}

## Latest Issues ${issueSampleNote}
${issuesText}

## Latest Pull Requests ${prSampleNote}
${prsText}

---

Generate a structured ${LANGUAGE_NAMES[lang]} ${cfg.name} project digest with the following sections:

1. **Today's Overview** - 3-5 sentences summarizing project status, including activity assessment
2. **Releases** - If new versions exist, detail changes, breaking changes, migration notes; omit if none
3. **Project Progress** - Merged/closed PRs today, what features advanced or were fixed
4. **Community Hot Topics** - Most active Issues/PRs with most comments/reactions (with links), analyze underlying needs
5. **Bugs & Stability** - Bugs, crashes, regressions reported today, ranked by severity, note if fix PRs exist
6. **Feature Requests & Roadmap Signals** - User-requested features, predict which might be in next version
7. **User Feedback Summary** - Real user pain points, use cases, satisfaction/dissatisfaction
8. **Backlog Watch** - Long-unanswered important Issues or PRs needing maintainer attention

Style: objective, data-driven, highlighting project health. Include GitHub links for each item.
`;
}

export function buildPeersComparisonPrompt(
  openclawDigest: RepoDigest,
  peerDigests: RepoDigest[],
  dateStr: string,
  lang = "en",
): string {
  const noActivityStr = t(lang).noActivity;

  const openclawSection = `## OpenClaw (core reference, github.com/${openclawDigest.config.repo})\n${openclawDigest.summary}`;

  const peerSections = peerDigests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  return `You are a senior analyst of the AI agent and personal AI assistant open-source ecosystem. The following are ${dateStr} community digest summaries for each project.

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

${openclawSection}

---

${peerSections}

---

Generate a cross-project comparison report in ${LANGUAGE_NAMES[lang]} with these sections:

1. **Ecosystem Overview** - 3-5 sentences on the overall personal AI assistant / agent open-source landscape
2. **Activity Comparison** - Table comparing Issues count, PR count, Release status, and health score for each project
3. **OpenClaw's Position** - Advantages vs peers, technical approach differences, community size comparison
4. **Shared Technical Focus Areas** - Requirements emerging across multiple projects (note which projects, specific needs)
5. **Differentiation Analysis** - Key differences in feature focus, target users, technical architecture
6. **Community Momentum & Maturity** - Activity tiers, which are rapidly iterating, which are stabilizing
7. **Trend Signals** - Industry trends extracted from community feedback, value for AI agent developers

Style: concise and professional, data-backed, suited for technical decision-makers and developers.
`;
}

export function buildSkillsPrompt(
  prs: GitHubItem[],
  issues: GitHubItem[],
  dateStr: string,
  lang = "en",
): string {
  const topPrs = topN(prs, 20);
  const topIssues = topN(issues, 15);

  const prsText = topPrs.map((p) => formatItem(p, lang)).join("\n") || t(lang).noneStr;
  const issuesText = topIssues.map((i) => formatItem(i, lang)).join("\n") || t(lang).noneStr;

  return `You are a technical analyst focused on the Claude Code ecosystem. The following data is from github.com/anthropics/skills (official Claude Code Skills repository). Analyze the community's most-watched Skills activity (data as of ${dateStr}).

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

## Repository Context
anthropics/skills is the official Claude Code Skills collection. Each PR typically represents a new or improved Skill. The community proposes new Skills and reports issues via Issues; PRs represent actual Skill submissions.

## Popular Pull Requests (sorted by comments, ${prs.length} total, showing top ${topPrs.length})
${prsText}

## Community Issues (sorted by comments, ${issues.length} total, showing top ${topIssues.length})
${issuesText}

---

Generate a Claude Code Skills community highlights report in ${LANGUAGE_NAMES[lang]} with these sections:

1. **Top Skills Ranking** - List the 5-8 most-discussed Skills (PRs) by comments/attention, describe each Skill's functionality, discussion highlights, and current status (open/merged/draft)
2. **Community Demand Trends** - From Issues, distill the most-anticipated new Skill directions (e.g. workflow automation, code review, test generation, documentation)
3. **High-Potential Pending Skills** - Active-comment PRs not yet merged; these Skills may land soon
4. **Skills Ecosystem Insight** - One-sentence summary: what is the community's most concentrated demand at the Skills level?

Style: concise and professional, include GitHub links for each item.
`;
}

export function buildComparisonPrompt(digests: RepoDigest[], dateStr: string, lang = "en"): string {
  const noActivityStr = t(lang).noActivity;

  const sections = digests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  return `You are a senior technical analyst of the AI developer tools ecosystem. The following are ${dateStr} community digest summaries for each major AI CLI tool:

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

${sections}

---

Generate a cross-tool comparison report in ${LANGUAGE_NAMES[lang]} with these sections:

1. **Ecosystem Overview** - 3-5 sentences on the overall AI CLI tools development landscape
2. **Activity Comparison** - Table comparing Issues count, PR count, Release status for each tool today
3. **Shared Feature Directions** - Requirements appearing across multiple tool communities (note which tools, specific needs)
4. **Differentiation Analysis** - Differences in feature focus, target users, and technical approach
5. **Community Momentum & Maturity** - Which tools have more active communities, which are rapidly iterating
6. **Trend Signals** - Industry trends from community feedback, reference value for developers

Style: concise and professional, data-backed, suited for technical decision-makers and developers.
`;
}

export function buildTrendingPrompt(data: TrendingData, dateStr: string, lang = "en"): string {
  const trendingSection =
    data.trendingFetchSuccess && data.trendingRepos.length > 0
      ? data.trendingRepos
          .map(
            (r) =>
              `- [${r.fullName}](${r.url})` +
              (r.language ? ` [${r.language}]` : "") +
              ` ⭐${r.totalStars.toLocaleString()}` +
              (r.todayStars > 0 ? ` (+${r.todayStars} today)` : "") +
              (r.forks > 0 ? ` 🍴${r.forks.toLocaleString()}` : "") +
              (r.description ? `\n  ${r.description}` : ""),
          )
          .join("\n")
      : "(Unable to fetch today's GitHub Trending list)";

  const searchSection =
    data.searchRepos.length > 0
      ? data.searchRepos
          .map(
            (r) =>
              `- [${r.fullName}](${r.url})` +
              (r.language ? ` [${r.language}]` : "") +
              ` ⭐${r.stargazersCount.toLocaleString()}` +
              ` [topic:${r.searchQuery}]` +
              (r.description ? `\n  ${r.description}` : ""),
          )
          .join("\n")
      : "(No search results)";

  return `You are a technical analyst focused on the AI open-source ecosystem. The following is ${dateStr} GitHub AI-related trending repository data. Please filter for AI relevance, categorize, and analyze trends.

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

## Data Sources
- **Trending List** (github.com/trending, today's stars most reliable): Real-time hot list with today's new stars
- **Topic Search** (GitHub Search API, topic tags): AI-related projects active in last 7 days, grouped by topic

---

## GitHub Today's Trending (${data.trendingRepos.length} repositories)
${trendingSection}

---

## AI Topic Search Results (${data.searchRepos.length} repositories, deduplicated)
${searchSection}

---

Generate a structured AI Open Source Trends Report in ${LANGUAGE_NAMES[lang]}:

**Step 1 (Filter)**: From the above data, select projects clearly related to AI/ML (exclude unrelated general tools, frontend frameworks, games, etc.). Skip non-AI trending repos.

**Step 2 (Categorize)**: Group filtered projects into these categories (a project can belong to multiple; pick the primary one):
- 🔧 AI Infrastructure (frameworks, SDKs, inference engines, dev tools, CLI)
- 🤖 AI Agents / Workflows (agent frameworks, automation, multi-agent systems)
- 📦 AI Applications (specific apps, vertical solutions)
- 🧠 LLMs / Training (model weights, training frameworks, fine-tuning tools)
- 🔍 RAG / Knowledge (vector databases, retrieval-augmented generation, knowledge management)

**Step 3 (Output Report)** with these sections:

1. **Today's Highlights** — 3-5 sentences on the most noteworthy AI open-source developments today

2. **Top Projects by Category** — For each category, list 3-8 representative projects, each with:
   - Project name (with link)
   - Stars data (total + today's new, if available)
   - One sentence: what it is and why it's worth attention today

3. **Trend Signal Analysis** — 200-300 words, distill from today's hot list:
   - Which type of AI tool is getting explosive community attention?
   - Any new tech stacks or directions appearing for the first time?
   - Connection to recent LLM releases / industry events

4. **Community Hot Spots** — Bullet list of 3-5 specific projects or directions worth developer focus, with brief reasoning

Style: ${LANGUAGE_NAMES[lang]}, professional and concise, must include GitHub links for every project.
`;
}

export function buildWebReportPrompt(results: WebFetchResult[], dateStr: string, lang = "en"): string {
  const isAnyFirstRun = results.some((r) => r.isFirstRun);

  const siteSections = results
    .map(({ siteName, isFirstRun, newItems, totalDiscovered }) => {
      const mode = isFirstRun
        ? `First full crawl (sitemap total ${totalDiscovered} URLs, showing latest ${newItems.length} articles)`
        : `Incremental update, ${newItems.length} new articles today`;

      if (newItems.length === 0) return `## ${siteName}\n\n(${mode}, no content to analyze)`;

      const itemsText = newItems
        .map((item) =>
          [
            `### [${item.title || item.url}](${item.url})`,
            `- Category: ${item.category} | Published/Updated: ${item.lastmod.slice(0, 10) || "unknown"}`,
            `- Excerpt: ${item.content || t(lang).unableToExtract}`,
          ].join("\n"),
        )
        .join("\n\n");

      return `## ${siteName} (${mode})\n\n${itemsText}`;
    })
    .join("\n\n---\n\n");

  const firstRunNote = isAnyFirstRun
    ? "This is the first full crawl. Please focus on the overall content landscape, historical context, and core themes of each site, rather than individual articles."
    : "This is an incremental update. Please focus on today's new content and assess its strategic significance in context.";

  return `You are a deep content analyst focused on AI, skilled at extracting strategic signals from official announcements, technical blogs, research papers, and product documentation.

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

The following content was crawled on ${dateStr} from Anthropic (claude.com / anthropic.com) and OpenAI (openai.com). ${firstRunNote}

${siteSections}

---

Generate a detailed AI Official Content Tracking Report in ${LANGUAGE_NAMES[lang]} with these sections:

1. **Today's Highlights** — 3-5 sentences on the most important new releases or developments, calling out key highlights

2. **Anthropic / Claude Content Highlights** — Organize important content by category (news / research / engineering / learn, etc.):
   - For each piece, 2-4 sentences extracting core insights, technical details, or business significance
   - Note publication date and original link
   - If first full crawl, trace important milestones chronologically

3. **OpenAI Content Highlights** — Same structure, organized by research / release / company / safety categories

4. **Strategic Signal Analysis** — Based on both companies' release cadence and content focus, analyze:
   - Each company's recent technical priorities (model capabilities / safety / productization / ecosystem)
   - Competitive dynamics: who is setting the agenda, who is following
   - Potential impact on developers and enterprise users

5. **Notable Details** — Extract hidden signals from titles, phrasing, and timing, e.g.:
   - New terms or topics appearing for the first time
   - Dense releases in a category (may signal a product milestone)
   - Policy, compliance, and safety developments

${isAnyFirstRun ? "6. **Content Landscape Overview** — First full crawl only: summarize the content category distribution for both companies and describe their content strategy style (academic-oriented vs product-oriented vs user stories, etc.)\n\n" : ""}Style: ${LANGUAGE_NAMES[lang]}, professional and detailed, suited for AI researchers, product managers, and technical decision-makers. Every item must include official links.
`;
}

export function buildWeeklyPrompt(
  dailyDigests: Record<string, string>,
  weekStr: string,
  lang = "en",
): string {
  const digestEntries = Object.entries(dailyDigests)
    .map(([date, content]) => `## ${date}\n\n${content}`)
    .join("\n\n---\n\n");

  return `You are a technical analyst focused on the AI open-source ecosystem. The following are daily digest summaries from the past 7 days (${weekStr}) of AI tool community activity. Generate a comprehensive weekly recap.

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

${digestEntries}

---

Generate an AI Tools Ecosystem Weekly Report in ${LANGUAGE_NAMES[lang]} with these sections:

1. **Week's Top Stories** - 5-8 most important events, releases, and community developments this week, each with date
2. **CLI Tools Progress** - Overall activity and key changes for each AI CLI tool (Claude Code, Codex, Gemini CLI, etc.)
3. **AI Agent Ecosystem** - Key developments from OpenClaw and peer projects this week
4. **Open Source Trends** - Most notable technical directions from GitHub Trending and AI community this week
5. **HN Community Highlights** - Core AI discussion topics and community sentiment on Hacker News this week
6. **Official Announcements** - Important content published by Anthropic and OpenAI this week (if any)
7. **Next Week's Signals** - Based on this week's data, predict trends and upcoming events worth watching

Style: ${LANGUAGE_NAMES[lang]}, concise and professional, helping technical developers quickly grasp the week's developments.
`;
}

export function buildMonthlyPrompt(
  sourceDigests: Record<string, string>,
  monthStr: string,
  lang = "en",
): string {
  const digestEntries = Object.entries(sourceDigests)
    .map(([key, content]) => `## ${key}\n\n${content}`)
    .join("\n\n---\n\n");

  return `You are a technical analyst focused on the AI open-source ecosystem. The following are ${monthStr} AI tool community digest summaries (${Object.keys(sourceDigests).length} reports total). Generate a comprehensive monthly review.

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

${digestEntries}

---

Generate an AI Tools Ecosystem Monthly Report in ${LANGUAGE_NAMES[lang]} with these sections:

1. **Month's Top Stories** - 5-10 most important events and milestones this month, in chronological order
2. **CLI Tools Monthly Progress** - Overall development trajectory, major releases, and community growth for each key AI CLI tool
3. **AI Agent Ecosystem Monthly Review** - Ecosystem landscape shifts, emerging projects, notable signals this month
4. **Technical Trend Summary** - Most significant technical directions and paradigm shifts in AI open-source this month
5. **Community Health Assessment** - Monthly activity comparison across major projects, developer engagement evaluation
6. **Official Announcements Review** - Strategic analysis of Anthropic and OpenAI content published this month
7. **Next Month's Outlook** - Based on this month's trends, predict key directions and potential events to watch

Style: ${LANGUAGE_NAMES[lang]}, in-depth analysis, data-driven, suited for monthly retrospectives and strategic decision-making.
`;
}

export function buildHnPrompt(data: HnData, dateStr: string, lang = "en"): string {
  const storiesText = data.stories
    .map(
      (s, i) =>
        `${i + 1}. **${s.title}**\n` +
        `   Link: ${s.url}\n` +
        `   Discussion: ${s.hnUrl}\n` +
        `   Score: ${s.points} | Comments: ${s.comments} | Author: @${s.author} | Time: ${s.createdAt.slice(0, 16)}`,
    )
    .join("\n\n");

  return `You are an AI industry news analyst. The following are AI-related top posts from Hacker News in the past 24 hours as of ${dateStr} (sorted by score, ${data.stories.length} total):

CRITICAL: You must write the entire response in ${LANGUAGE_NAMES[lang]}. All headings, labels, descriptions, and commentary must be in ${LANGUAGE_NAMES[lang]}.

---

${storiesText}

---

Generate a structured Hacker News AI Community Digest in ${LANGUAGE_NAMES[lang]}:

1. **Today's Highlights** — 3-5 sentences on the hottest AI discussion topics and community sentiment on HN today

2. **Top News & Discussions** — Organized by category, select the 2-5 most representative items per category, each with:
   - Title (with original link) + HN discussion link
   - Score and comment count
   - One sentence: why this matters, what the community's typical reaction is

   Categories:
   - 🔬 Models & Research (new model releases, papers, benchmarks)
   - 🛠️ Tools & Engineering (open-source projects, frameworks, engineering practices)
   - 🏢 Industry News (company news, funding, product launches)
   - 💬 Opinions & Debates (notable Ask HN, Show HN, or hot discussion threads)

3. **Community Sentiment Signal** — 100-200 words analyzing today's HN AI discussion mood and focus:
   - Which topics are most active (high score + high comments)?
   - Any clear points of controversy or consensus?
   - Compared to last cycle, any notable shift in focus?

4. **Worth Deep Reading** — List 2-3 pieces most worth developers/researchers reading in depth, with brief reasoning

Style: ${LANGUAGE_NAMES[lang]}, concise and professional, preserve all original links.
`;
}
