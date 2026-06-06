export interface IslamicEventEntry {
  id: string;
  name: string;
  hijriMonth: number;
  hijriDay: number;
  type: "event" | "holiday";
  emoji: string;
}

export const ISLAMIC_EVENTS: IslamicEventEntry[] = [
  {
    id: "isra-miraj",
    name: "Isra' Mi'raj",
    hijriMonth: 7,
    hijriDay: 27,
    type: "event",
    emoji: "🌙",
  },
  {
    id: "ramadan",
    name: "Ramadan begins",
    hijriMonth: 9,
    hijriDay: 1,
    type: "event",
    emoji: "🌙",
  },
  {
    id: "nuzul-quran",
    name: "Nuzul Al-Qur'an",
    hijriMonth: 9,
    hijriDay: 17,
    type: "event",
    emoji: "📖",
  },
  {
    id: "eid-fitr",
    name: "Eid al-Fitr",
    hijriMonth: 10,
    hijriDay: 1,
    type: "holiday",
    emoji: "🎉",
  },
  {
    id: "arafah",
    name: "Day of Arafah",
    hijriMonth: 12,
    hijriDay: 9,
    type: "event",
    emoji: "🤲",
  },
  {
    id: "eid-adha",
    name: "Eid al-Adha",
    hijriMonth: 12,
    hijriDay: 10,
    type: "holiday",
    emoji: "🐑",
  },
  {
    id: "islamic-new-year",
    name: "Islamic New Year",
    hijriMonth: 1,
    hijriDay: 1,
    type: "event",
    emoji: "✨",
  },
  {
    id: "ashura",
    name: "Day of Ashura",
    hijriMonth: 1,
    hijriDay: 10,
    type: "event",
    emoji: "🕯️",
  },
  {
    id: "mawlid",
    name: "Mawlid al-Nabi",
    hijriMonth: 3,
    hijriDay: 12,
    type: "event",
    emoji: "🕊️",
  },
];
