export interface LocaleStrings {
  noActivity: string;
  summaryFailed: string;
  skillsFailed: string;
  trendingNoData: string;
  trendingFailed: string;
  webNoNewContent: string;
  webFetchFailed: string;
  hnFetchFailed: string;
  cliTitle: string;
  cliMeta: string;
  cliSkillsHeading: string;
  cliSkillsSource: string;
  cliComparison: string;
  cliDetail: string;
  openclawTitle: string;
  openclawMeta: string;
  openclawDeepDive: string;
  openclawComparison: string;
  openclawPeers: string;
  webTitle: string;
  webMeta: string;
  webSources: string;
  trendingTitle: string;
  trendingMeta: string;
  hnTitle: string;
  hnMeta: string;
  issueCliTitle: string;
  issueOpenclawTitle: string;
  issueWebTitle: string;
  issueTrendingTitle: string;
  issueHnTitle: string;
  issueLabelDigest: string;
  issueLabelOpenclaw: string;
  issueLabelWeb: string;
  issueLabelTrending: string;
  issueLabelHn: string;
  fileSuffixCli: string;
  fileSuffixOpenclaw: string;
  fileSuffixWeb: string;
  fileSuffixTrending: string;
  fileSuffixHn: string;
  formatItemAuthor: string;
  formatItemCreated: string;
  formatItemUpdated: string;
  formatItemComments: string;
  formatItemUrl: string;
  formatItemSummary: string;
  sampleNote: string;
  noneStr: string;
  unableToExtract: string;
  issueTruncation: string;
  weeklyTitle: string;
  weeklyMeta: string;
  monthlyTitle: string;
  monthlyMeta: string;
  sourceLabelWeekly: string;
  sourceLabelDailySampled: string;
  digestTruncation: string;
  weeklyTruncation: string;
  manifestCli: string;
  manifestAgents: string;
  manifestWeb: string;
  manifestTrending: string;
  manifestHn: string;
  manifestWeekly: string;
  manifestMonthly: string;
  notifyCli: string;
  notifyAgents: string;
  notifyWeb: string;
  notifyTrending: string;
  notifyHn: string;
  notifyWeekly: string;
  notifyMonthly: string;
  notifyFooter: string;
  autoGenFooter: string;
}

export const STRINGS: Record<string, LocaleStrings> = {
  en: {
    noActivity: "No activity in the last 24 hours.",
    summaryFailed: "⚠️ Summary generation failed.",
    skillsFailed: "⚠️ Skills summary generation failed.",
    trendingNoData: "⚠️ Trending data unavailable, unable to generate report.",
    trendingFailed: "⚠️ Trending report generation failed.",
    webNoNewContent: "No new content found.",
    webFetchFailed: "⚠️ Web content fetch failed.",
    hnFetchFailed: "⚠️ HN fetch failed.",
    cliTitle: "AI CLI Tools Community Digest",
    cliMeta: "> Generated: {utcStr} UTC | Tools covered: {count}",
    cliSkillsHeading: "## Claude Code Skills Highlights",
    cliSkillsSource: "> Source: [{repo}](https://github.com/{repo})",
    cliComparison: "## Cross-Tool Comparison",
    cliDetail: "## Per-Tool Reports",
    openclawTitle: "OpenClaw Ecosystem Digest",
    openclawMeta: "> Issues: {issues} | PRs: {prs} | Projects covered: {projects} | Generated: {utcStr} UTC",
    openclawDeepDive: "## OpenClaw Deep Dive",
    openclawComparison: "## Cross-Ecosystem Comparison",
    openclawPeers: "## Peer Project Reports",
    webTitle: "Official AI Content Report",
    webMeta: "> {mode} | New content: {count} articles | Generated: {utcStr} UTC",
    webSources: "Sources:",
    trendingTitle: "AI Open Source Trends",
    trendingMeta: "> Sources: GitHub Trending + GitHub Search API | Generated: {utcStr} UTC",
    hnTitle: "Hacker News AI Community Digest",
    hnMeta:
      "> Source: [Hacker News](https://news.ycombinator.com/) | {count} stories | Generated: {utcStr} UTC",
    issueCliTitle: "📊 AI CLI Tools Community Digest",
    issueOpenclawTitle: "🦞 OpenClaw Ecosystem Digest",
    issueWebTitle: "🌐 Official AI Content Report",
    issueTrendingTitle: "📈 AI Open Source Trends",
    issueHnTitle: "📰 Hacker News AI Digest",
    issueLabelDigest: "digest",
    issueLabelOpenclaw: "openclaw",
    issueLabelWeb: "web",
    issueLabelTrending: "trending",
    issueLabelHn: "hn",
    fileSuffixCli: "ai-cli.md",
    fileSuffixOpenclaw: "ai-agents.md",
    fileSuffixWeb: "ai-web.md",
    fileSuffixTrending: "ai-trending.md",
    fileSuffixHn: "ai-hn.md",
    formatItemAuthor: "Author",
    formatItemCreated: "Created",
    formatItemUpdated: "Updated",
    formatItemComments: "Comments",
    formatItemUrl: "URL",
    formatItemSummary: "Summary",
    sampleNote: "(Total: {total} items; showing top {sampled} by comment count)",
    noneStr: "None",
    unableToExtract: "(Unable to extract text content)",
    issueTruncation: "\n\n---\n> ⚠️ 内容超过 GitHub Issue 上限，完整报告见提交的 Markdown 文件。",
    weeklyTitle: "AI Tools Ecosystem Weekly Report",
    weeklyMeta: "> Coverage: {range} | Generated: {utcStr} UTC",
    monthlyTitle: "AI Tools Ecosystem Monthly Report",
    monthlyMeta: "> Sources: {sources} | Generated: {utcStr} UTC",
    sourceLabelWeekly: "{n} weekly reports",
    sourceLabelDailySampled: "{n} daily reports (sampled every 4 days)",
    digestTruncation: "...[truncated]",
    weeklyTruncation: "...[truncated]",
    manifestCli: "AI CLI Tools Digest",
    manifestAgents: "AI Agents Ecosystem Digest",
    manifestWeb: "Official AI Content Report",
    manifestTrending: "AI Open Source Trends",
    manifestHn: "Hacker News AI Community Digest",
    manifestWeekly: "AI Tools Weekly Digest",
    manifestMonthly: "AI Tools Monthly Digest",
    notifyCli: "AI CLI Tools",
    notifyAgents: "AI Agents Ecosystem",
    notifyWeb: "Official Updates",
    notifyTrending: "GitHub Trends",
    notifyHn: "HN Community",
    notifyWeekly: "AI Tools Weekly",
    notifyMonthly: "AI Tools Monthly",
    notifyFooter: "",
    autoGenFooter: "",
  },
};

export const SUPPORTED_LOCALES = ["en"] as const;

export const validateLocale = (lang: string): string => {
  if (SUPPORTED_LOCALES.includes(lang as "en")) return lang;
  console.warn(`Unsupported locale "${lang}", falling back to "en"`);
  return "en";
};

export const t = (lang?: string): LocaleStrings => {
  const locale = lang ? validateLocale(lang) : "en";
  return (STRINGS[locale] ?? STRINGS.en) as LocaleStrings;
};
