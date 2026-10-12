import type { Testament } from "./books";

export type TranslationSource = "bundled" | "bible-api" | "licensed";

export interface Translation {
  id: string;            // canonical id used for caching + API requests
  abbreviation: string;  // short display tag, e.g. "KJV"
  name: string;          // full name, e.g. "King James Version"
  blurb: string;         // 1-line description
  source: TranslationSource;
  // Provider id for bible-api.com (only relevant when source === "bible-api")
  apiCode?: string;
  availableTestaments?: Testament[];
  // For licensed translations, the licensing note shown to the user
  licenseNote?: string;
}

export const BUNDLED_TRANSLATION_ID = "kjv";

export const TRANSLATIONS: Translation[] = [
  {
    id: "kjv",
    abbreviation: "KJV",
    name: "King James Version",
    blurb: "1611 classic. Bundled offline — instant, no network needed.",
    source: "bundled",
  },
  {
    id: "web",
    abbreviation: "WEB",
    name: "World English Bible",
    blurb: "Modern, public-domain English. Updated KJV-style readability.",
    source: "bible-api",
    apiCode: "web",
  },
  {
    id: "asv",
    abbreviation: "ASV",
    name: "American Standard Version",
    blurb: "1901 American revision of the KJV. Formal, literal.",
    source: "bible-api",
    apiCode: "asv",
  },
  {
    id: "bbe",
    abbreviation: "BBE",
    name: "Bible in Basic English",
    blurb: "Simple, ~1000-word vocabulary. Easy reading.",
    source: "bible-api",
    apiCode: "bbe",
  },
  {
    id: "ylt",
    abbreviation: "YLT",
    name: "Young's Literal Translation",
    blurb: "Word-for-word literal rendering. New Testament only.",
    source: "bible-api",
    apiCode: "ylt",
    availableTestaments: ["NT"],
  },
  {
    id: "darby",
    abbreviation: "DARBY",
    name: "Darby Bible",
    blurb: "1890 literal translation by John Nelson Darby.",
    source: "bible-api",
    apiCode: "darby",
  },
  {
    id: "esv",
    abbreviation: "ESV",
    name: "English Standard Version",
    blurb: "Modern essentially-literal translation.",
    source: "licensed",
    licenseNote:
      "ESV requires a free non-commercial API key from api.esv.org. Add the key to enable.",
  },
  {
    id: "niv",
    abbreviation: "NIV",
    name: "New International Version",
    blurb: "Popular thought-for-thought modern translation.",
    source: "licensed",
    licenseNote:
      "NIV is licensed by Biblica. A paid API key (api.bible / Bible Gateway) is required.",
  },
];

export function getTranslation(id: string): Translation {
  return TRANSLATIONS.find((t) => t.id === id) ?? TRANSLATIONS[0];
}
