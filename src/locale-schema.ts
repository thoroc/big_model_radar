/**
 * Zod schemas for locale file validation.
 * Derives the LocaleData type from the schema — no manual interface to maintain.
 */

import { z } from "zod";

const LocaleMetaSchema = z.object({
  name: z.string(),
  nativeName: z.string(),
});

const LocaleDataSchema = z.object({
  noActivity: z.string(),
  summaryFailed: z.string(),
  skillsFailed: z.string(),
  trendingNoData: z.string(),
  trendingFailed: z.string(),
  webNoNewContent: z.string(),
  webFetchFailed: z.string(),
  hnFetchFailed: z.string(),
  cliTitle: z.string(),
  cliMeta: z.string(),
  cliSkillsHeading: z.string(),
  cliSkillsSource: z.string(),
  cliComparison: z.string(),
  cliDetail: z.string(),
  openclawTitle: z.string(),
  openclawMeta: z.string(),
  openclawDeepDive: z.string(),
  openclawComparison: z.string(),
  openclawPeers: z.string(),
  webTitle: z.string(),
  webMeta: z.string(),
  webSources: z.string(),
  trendingTitle: z.string(),
  trendingMeta: z.string(),
  hnTitle: z.string(),
  hnMeta: z.string(),
  issueCliTitle: z.string(),
  issueOpenclawTitle: z.string(),
  issueWebTitle: z.string(),
  issueTrendingTitle: z.string(),
  issueHnTitle: z.string(),
  issueLabelDigest: z.string(),
  issueLabelOpenclaw: z.string(),
  issueLabelWeb: z.string(),
  issueLabelTrending: z.string(),
  issueLabelHn: z.string(),
  fileSuffixCli: z.string(),
  fileSuffixOpenclaw: z.string(),
  fileSuffixWeb: z.string(),
  fileSuffixTrending: z.string(),
  fileSuffixHn: z.string(),
  formatItemAuthor: z.string(),
  formatItemCreated: z.string(),
  formatItemUpdated: z.string(),
  formatItemComments: z.string(),
  formatItemUrl: z.string(),
  formatItemSummary: z.string(),
  sampleNote: z.string(),
  noneStr: z.string(),
  unableToExtract: z.string(),
  issueTruncation: z.string(),
  weeklyTitle: z.string(),
  weeklyMeta: z.string(),
  monthlyTitle: z.string(),
  monthlyMeta: z.string(),
  sourceLabelWeekly: z.string(),
  sourceLabelDailySampled: z.string(),
  digestTruncation: z.string(),
  weeklyTruncation: z.string(),
  manifestCli: z.string(),
  manifestAgents: z.string(),
  manifestWeb: z.string(),
  manifestTrending: z.string(),
  manifestHn: z.string(),
  manifestWeekly: z.string(),
  manifestMonthly: z.string(),
  notifyCli: z.string(),
  notifyAgents: z.string(),
  notifyWeb: z.string(),
  notifyTrending: z.string(),
  notifyHn: z.string(),
  notifyWeekly: z.string(),
  notifyMonthly: z.string(),
  notifyFooter: z.string(),
  autoGenFooter: z.string(),
});

const LocaleFileSchema = LocaleDataSchema.extend({
  _meta: LocaleMetaSchema,
});

export type LocaleMeta = z.infer<typeof LocaleMetaSchema>;
export type LocaleData = z.infer<typeof LocaleDataSchema>;
export { LocaleMetaSchema, LocaleDataSchema, LocaleFileSchema };
