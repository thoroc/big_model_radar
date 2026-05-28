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
import zh from "../locales/zh.json";
import ja from "../locales/ja.json";
import ko from "../locales/ko.json";
import es from "../locales/es.json";
import pt from "../locales/pt.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import it from "../locales/it.json";
import pl from "../locales/pl.json";
import ru from "../locales/ru.json";
import ar from "../locales/ar.json";
import tr from "../locales/tr.json";
import vi from "../locales/vi.json";
import th from "../locales/th.json";
import nl from "../locales/nl.json";

export const STRINGS: Record<string, LocaleStrings> = {
  en: en as LocaleStrings,
  zh: zh as LocaleStrings,
  ja: ja as LocaleStrings,
  ko: ko as LocaleStrings,
  es: es as LocaleStrings,
  pt: pt as LocaleStrings,
  fr: fr as LocaleStrings,
  de: de as LocaleStrings,
  it: it as LocaleStrings,
  pl: pl as LocaleStrings,
  ru: ru as LocaleStrings,
  ar: ar as LocaleStrings,
  tr: tr as LocaleStrings,
  vi: vi as LocaleStrings,
  th: th as LocaleStrings,
  nl: nl as LocaleStrings,
};

export const SUPPORTED_LOCALES = [
  "en",
  "zh",
  "ja",
  "ko",
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "pl",
  "ru",
  "ar",
  "tr",
  "vi",
  "th",
  "nl",
] as const;

export const validateLocale = (lang: string): string => {
  if (SUPPORTED_LOCALES.includes(lang as (typeof SUPPORTED_LOCALES)[number])) return lang;
  console.warn(`Unsupported locale "${lang}", falling back to "en"`);
  return "en";
};

export const t = (lang?: string): LocaleStrings => {
  const locale = lang ? validateLocale(lang) : "en";
  return (STRINGS[locale] ?? STRINGS.en) as LocaleStrings;
};
