/**
 * Weekly and monthly rollup report generator.
 * Reads existing daily digest files — no GitHub API calls needed.
 */

import fs from "node:fs";
import path from "node:path";
import { callLlm, saveFile, autoGenFooter } from "./report.ts";
import { buildWeeklyPrompt, buildMonthlyPrompt } from "./prompts.ts";
import { createGitHubIssue } from "./github.ts";
import { t } from "./strings.ts";

const DIGESTS_DIR = "digests";
const MAX_CHARS_PER_REPORT = 2500;

// Source report types to read for rollups (in priority order)
const ROLLUP_SOURCES = ["ai-cli", "ai-agents", "ai-trending", "ai-hn", "ai-web"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getDateDirs(): string[] {
  if (!fs.existsSync(DIGESTS_DIR)) return [];
  return fs
    .readdirSync(DIGESTS_DIR)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && fs.statSync(path.join(DIGESTS_DIR, d)).isDirectory())
    .sort()
    .reverse();
}

/** Read and truncate a daily digest file. Returns null if not found. */
export function readDailyDigest(date: string, lang = "en"): string | null {
  for (const type of ROLLUP_SOURCES) {
    const p = path.join(DIGESTS_DIR, date, `${type}.md`);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      const truncated = content.slice(0, MAX_CHARS_PER_REPORT);
      return truncated.length < content.length ? truncated + "\n" + t(lang).digestTruncation : truncated;
    }
  }
  return null;
}

/** Read a weekly report file. Returns null if not found. */
export function readWeeklyDigest(date: string, lang = "en"): string | null {
  const p = path.join(DIGESTS_DIR, date, "ai-weekly.md");
  if (!fs.existsSync(p)) return null;
  const content = fs.readFileSync(p, "utf-8");
  return content.slice(0, 3000) + (content.length > 3000 ? "\n" + t(lang).weeklyTruncation : "");
}

/** Format a date as ISO week string, e.g. "2026-W10". */
export function toWeekStr(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Weekly rollup
// ---------------------------------------------------------------------------

export async function runWeeklyRollup(lang = "en"): Promise<void> {
  const s = t(lang);
  const now = new Date();
  const cstDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const dateStr = cstDate.toISOString().slice(0, 10);
  const utcStr = now.toISOString().slice(0, 16).replace("T", " ");
  const weekStr = toWeekStr(cstDate);
  const digestRepo = process.env["DIGEST_REPO"] ?? "";

  console.log(`[weekly] Generating rollup for ${weekStr} (date: ${dateStr})`);

  const allDates = getDateDirs();
  const last7 = allDates.slice(0, 7);

  const dailyDigests: Record<string, string> = {};
  for (const date of last7) {
    const content = readDailyDigest(date, lang);
    if (content) dailyDigests[date] = content;
  }

  if (Object.keys(dailyDigests).length === 0) {
    console.log("[weekly] No daily digests found, skipping.");
    return;
  }

  console.log(
    `[weekly] Found ${Object.keys(dailyDigests).length} daily digests: ${Object.keys(dailyDigests).join(", ")}`,
  );

  const footer = autoGenFooter(lang);

  console.log("[weekly] Calling LLM for weekly report...");
  const summary = await callLlm(buildWeeklyPrompt(dailyDigests, weekStr), 8192);
  const content =
    `# ${s.weeklyTitle} ${weekStr}\n\n` +
    s.weeklyMeta.replace("{range}", `${last7[last7.length - 1]} ~ ${last7[0]}`).replace("{utcStr}", utcStr) +
    `\n\n` +
    `---\n\n` +
    summary +
    footer;
  console.log(`  Saved ${saveFile(content, dateStr, "ai-weekly.md")}`);
  if (digestRepo) {
    const issueTitle = `📅 AI Tools Weekly Report ${weekStr}`;
    const url = await createGitHubIssue(issueTitle, content, "weekly", lang);
    console.log(`  Created weekly issue: ${url}`);
  }

  console.log("[weekly] Done!");
}

// ---------------------------------------------------------------------------
// Monthly rollup
// ---------------------------------------------------------------------------

export async function runMonthlyRollup(lang = "en"): Promise<void> {
  const s = t(lang);
  const now = new Date();
  const cstDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const prevMonth = new Date(Date.UTC(cstDate.getUTCFullYear(), cstDate.getUTCMonth() - 1, 1));
  const monthStr = prevMonth.toISOString().slice(0, 7);
  const dateStr = cstDate.toISOString().slice(0, 10);
  const utcStr = now.toISOString().slice(0, 16).replace("T", " ");
  const digestRepo = process.env["DIGEST_REPO"] ?? "";

  console.log(`[monthly] Generating rollup for ${monthStr} (date: ${dateStr})`);

  const allDates = getDateDirs();

  const monthDates = allDates.filter((d) => d.startsWith(monthStr));
  const weeklyDates = monthDates.filter((d) => fs.existsSync(path.join(DIGESTS_DIR, d, "ai-weekly.md")));

  let sourceDigests: Record<string, string>;
  let sourceLabel: string;

  if (weeklyDates.length >= 2) {
    sourceLabel = s.sourceLabelWeekly.replace("{n}", String(weeklyDates.length));
    sourceDigests = {};
    for (const date of weeklyDates) {
      const content = readWeeklyDigest(date, lang);
      if (content) sourceDigests[date] = content;
    }
  } else {
    const sampled = monthDates.filter((_, i) => i % 4 === 0).slice(0, 10);
    sourceLabel = s.sourceLabelDailySampled.replace("{n}", String(sampled.length));
    sourceDigests = {};
    for (const date of sampled) {
      const content = readDailyDigest(date, lang);
      if (content) sourceDigests[date] = content;
    }
  }

  if (Object.keys(sourceDigests).length === 0) {
    console.log(`[monthly] No source digests found for ${monthStr}, skipping.`);
    return;
  }

  console.log(`[monthly] Source: ${sourceLabel}`);

  const footer = autoGenFooter(lang);

  console.log("[monthly] Calling LLM for monthly report...");
  const summary = await callLlm(buildMonthlyPrompt(sourceDigests, monthStr), 8192);
  const content =
    `# ${s.monthlyTitle} ${monthStr}\n\n` +
    s.monthlyMeta.replace("{sources}", sourceLabel).replace("{utcStr}", utcStr) +
    `\n\n` +
    `---\n\n` +
    summary +
    footer;
  console.log(`  Saved ${saveFile(content, dateStr, "ai-monthly.md")}`);
  if (digestRepo) {
    const issueTitle = `📆 AI Tools Monthly Report ${monthStr}`;
    const url = await createGitHubIssue(issueTitle, content, "monthly", lang);
    console.log(`  Created monthly issue: ${url}`);
  }

  console.log("[monthly] Done!");
}
