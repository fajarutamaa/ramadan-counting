export interface IslamicQuote {
  text: string;
  source: string;
  category: "patience" | "gratitude" | "prayer" | "ramadan" | "faith";
}

export const islamicQuotes: IslamicQuote[] = [
  {
    text: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.",
    source: "Quran 2:183",
    category: "ramadan",
  },
  {
    text: "The month of Ramadan in which was revealed the Quran, a guidance for the people and clear proofs of guidance and criterion.",
    source: "Quran 2:185",
    category: "ramadan",
  },
  {
    text: "When Ramadan enters, the gates of Paradise are opened, the gates of Hellfire are closed and the devils are chained.",
    source: "Sahih Bukhari",
    category: "ramadan",
  },
  {
    text: "Whoever fasts during Ramadan out of sincere faith and hoping to attain Allah's rewards, then all his past sins will be forgiven.",
    source: "Sahih Bukhari",
    category: "ramadan",
  },
  {
    text: "Indeed, Allah is with the patient.",
    source: "Quran 2:153",
    category: "patience",
  },
  {
    text: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive to Allah.",
    source: "Quran 2:45",
    category: "prayer",
  },
  {
    text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    source: "Quran 2:152",
    category: "gratitude",
  },
  {
    text: "Indeed, prayer has been decreed upon the believers a decree of specified times.",
    source: "Quran 4:103",
    category: "prayer",
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for him.",
    source: "Quran 65:3",
    category: "faith",
  },
  {
    text: "Verily, with hardship comes ease.",
    source: "Quran 94:6",
    category: "patience",
  },
  {
    text: "The best of you are those who learn the Quran and teach it.",
    source: "Sahih Bukhari",
    category: "faith",
  },
  {
    text: "Allah does not burden a soul beyond that it can bear.",
    source: "Quran 2:286",
    category: "patience",
  },
  {
    text: "If you are grateful, I will surely increase you in favor.",
    source: "Quran 14:7",
    category: "gratitude",
  },
  {
    text: "The strong person is not the one who can overpower others, but the one who controls himself when angry.",
    source: "Sahih Bukhari",
    category: "patience",
  },
  {
    text: "Whoever does righteousness, whether male or female, while he is a believer - We will surely cause him to live a good life.",
    source: "Quran 16:97",
    category: "faith",
  },
];
