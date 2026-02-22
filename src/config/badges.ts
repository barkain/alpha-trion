export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: Badge[] = [
  {
    id: "firstWorld",
    name: "צוֹעֵד רִאשׁוֹן",
    emoji: "🏅",
    description: "סיימת את העולם הראשון",
  },
  {
    id: "perfectScore",
    name: "מוּשְׁלָם",
    emoji: "💎",
    description: "קיבלת 3 כוכבים בעולם",
  },
  {
    id: "streak3",
    name: "רָצָף אֵשׁ",
    emoji: "🔥",
    description: "ענית נכון 3 פעמים ברצף",
  },
  {
    id: "allStars",
    name: "אַסְפָן כּוֹכָבִים",
    emoji: "🌟",
    description: "אספת 10 כוכבים",
  },
  {
    id: "speedDemon",
    name: "בָּזָק",
    emoji: "⚡",
    description: "ענית נכון תוך 10 שניות",
  },
  {
    id: "kingdomHero",
    name: "גִּיבּוֹר הַמַּמְלָכָה",
    emoji: "👑",
    description: "סיימת את כל 5 העולמות",
  },
];
