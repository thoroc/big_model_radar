import fs from "fs";
import path from "path";
import { t } from "./strings.ts";

const DIGESTS_DIR = "digests";
const MANIFEST_PATH = "manifest.json";
const FEED_PATH = "feed.xml";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const REPORT_FILES = [
  "ai-cli",
  "ai-agents",
  "ai-web",
  "ai-trending",
  "ai-hn",
  "ai-weekly",
  "ai-monthly",
] as const;
const MAX_FEED_ITEMS = 30;

export const buildReportLabels = (lang = "en"): Record<string, string> => {
  const s = t(lang);
  return {
    "ai-cli": s.manifestCli,
    "ai-agents": s.manifestAgents,
    "ai-web": s.manifestWeb,
    "ai-trending": s.manifestTrending,
    "ai-hn": s.manifestHn,
    "ai-weekly": s.manifestWeekly,
    "ai-monthly": s.manifestMonthly,
  };
};

export const REPORT_LABELS: Record<string, string> = buildReportLabels();

interface DateEntry {
  date: string;
  reports: string[];
}

interface Manifest {
  generated: string;
  dates: DateEntry[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function resolveSiteUrl(): string {
  const explicit = process.env["PAGES_URL"] ?? process.env["SITE_URL"];
  if (explicit) return explicit.replace(/\/$/, "");

  const repo = process.env["DIGEST_REPO"] ?? process.env["GITHUB_REPOSITORY"];
  if (repo) {
    const [owner, name] = repo.split("/");
    if (owner && name) return `https://${owner}.github.io/${name}`;
  }

  throw new Error("Missing site URL. Set PAGES_URL, SITE_URL, DIGEST_REPO, or GITHUB_REPOSITORY.");
}

function toRfc822(date: Date): string {
  return (
    `${DAYS[date.getUTCDay()]}, ${String(date.getUTCDate()).padStart(2, "0")} ` +
    `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ` +
    `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")} +0000`
  );
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const SITE_URL = resolveSiteUrl();

const entries = fs
  .readdirSync(DIGESTS_DIR)
  .filter((name) => DATE_RE.test(name) && fs.statSync(path.join(DIGESTS_DIR, name)).isDirectory())
  .sort()
  .reverse()
  .map((date) => {
    const reports = REPORT_FILES.filter((r) => fs.existsSync(path.join(DIGESTS_DIR, date, `${r}.md`)));
    return { date, reports };
  })
  .filter((e) => e.reports.length > 0);

const manifest: Manifest = {
  generated: new Date().toISOString(),
  dates: entries,
};

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest.json updated: ${entries.length} dates`);

// ── RSS Feed ──────────────────────────────────────────────────────────────────

const feedItems: Array<{ date: string; report: string }> = [];
outer: for (const entry of entries) {
  for (const report of entry.reports) {
    feedItems.push({ date: entry.date, report });
    if (feedItems.length >= MAX_FEED_ITEMS) break outer;
  }
}

const buildDate = toRfc822(new Date());

const itemsXml = feedItems
  .map(({ date, report }) => {
    const label = REPORT_LABELS[report] ?? report;
    const title = `${label} ${date}`;
    const link = `${SITE_URL}/#${date}/${report}`;
    const parts = date.split("-").map(Number);
    const pubDate = toRfc822(new Date(Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!)));
    return [
      "    <item>",
      `      <title>${escapeXml(title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <pubDate>${pubDate}</pubDate>`,
      `      <description>${escapeXml(title)}</description>`,
      "    </item>",
    ].join("\n");
  })
  .join("\n");

const feedXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
  `  <channel>\n` +
  `    <title>Big Model Radar</title>\n` +
  `    <link>${SITE_URL}</link>\n` +
  `    <description>Daily AI ecosystem digest</description>\n` +
  `    <language>en</language>\n` +
  `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n` +
  `    <lastBuildDate>${buildDate}</lastBuildDate>\n` +
  itemsXml +
  `\n  </channel>\n` +
  `</rss>\n`;

fs.writeFileSync(FEED_PATH, feedXml);
console.log(`feed.xml updated: ${feedItems.length} items`);
