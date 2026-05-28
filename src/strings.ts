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

import en from "../locales/en.json";

export const STRINGS: Record<string, LocaleStrings> = {
  en: en as LocaleStrings,
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
