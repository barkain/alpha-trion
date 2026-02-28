import type { World, CategoryId, Category, Difficulty } from "../types";

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export const CATEGORIES: Record<CategoryId, Category> = {
  math: { name: "חשבון", icon: "🧮", color: "#FF6B35" },
  symbols: { name: "חידות סמלים", icon: "🔮", color: "#9B59B6" },
  words: { name: "יחסי מילים", icon: "📚", color: "#2ECC71" },
  patterns: { name: "סדרות וחוקיות", icon: "🔢", color: "#3498DB" },
  inequalities: { name: "אי-שוויון", icon: "⚖️", color: "#FF6B6B" },
  reading: { name: "הבנת הנקרא", icon: "📖", color: "#4ECDC4" },
  sentences: { name: "השלמת משפטים", icon: "✏️", color: "#E8A838" },
  oddOneOut: { name: "יוצא דופן", icon: "🎯", color: "#C75BCC" },
  shapes: { name: "השלמת צורות", icon: "🔷", color: "#4A90D9" },
  numberFigures: { name: "מספרים בצורות", icon: "📐", color: "#E67E22" },
};

export const WORLDS: World[] = [
  {
    id: 0,
    name: "יַעַר הַחֵשְׁבּוֹן",
    emoji: "🌲",
    characterId: "zohar",
    categories: ["math", "inequalities", "numberFigures"],
    questionsNeeded: 4,
    difficultyMix: { easy: 0, medium: 10, hard: 10 },
    scene: {
      palette: ["#1a472a", "#2d5016", "#0d2818"],
      fogDensity: 0.4,
      scenePromptHint:
        "enchanted forest with tall ancient trees, glowing mushrooms, fireflies, a fox den with golden numbers floating",
    },
  },
  {
    id: 1,
    name: "מְעָרַת הַסְּמָלִים",
    emoji: "🔮",
    characterId: "nurit",
    categories: ["symbols"],
    questionsNeeded: 4,
    difficultyMix: { easy: 0, medium: 10, hard: 10 },
    scene: {
      palette: ["#2d1b69", "#4a1942", "#1a0533"],
      fogDensity: 0.6,
      scenePromptHint:
        "mystical purple cave with glowing crystals on walls, ancient runes, an owl perch, floating symbols",
    },
  },
  {
    id: 2,
    name: "סִפְרִיַּת הַמִּלִּים",
    emoji: "📖",
    characterId: "daniel",
    categories: ["words", "reading", "sentences", "oddOneOut"],
    questionsNeeded: 5,
    difficultyMix: { easy: 0, medium: 11, hard: 9 },
    scene: {
      palette: ["#1b4332", "#2d6a4f", "#1b3a2a"],
      fogDensity: 0.3,
      scenePromptHint:
        "magical floating library, books hovering mid-air, a shy green dragon reading, word-runes glowing on shelves",
    },
  },
  {
    id: 3,
    name: "מִגְדַּל הַדְּפוּסִים",
    emoji: "🏰",
    characterId: "miri",
    categories: ["patterns", "shapes"],
    questionsNeeded: 5,
    difficultyMix: { easy: 0, medium: 11, hard: 9 },
    scene: {
      palette: ["#1a1a5e", "#2e2e8a", "#0d0d3b"],
      fogDensity: 0.35,
      scenePromptHint:
        "tall blue wizard tower, spiraling staircases, magical pattern sigils floating, a young sorceress",
    },
  },
  {
    id: 4,
    name: "הָאַרְמוֹן הַגָּדוֹל",
    emoji: "👑",
    characterId: "king",
    categories: ["math", "symbols", "words", "patterns", "inequalities", "reading", "sentences", "oddOneOut", "shapes", "numberFigures"],
    questionsNeeded: 5,
    difficultyMix: { easy: 0, medium: 9, hard: 11 },
    scene: {
      palette: ["#5c3d1e", "#8b6914", "#3d2806"],
      fogDensity: 0.25,
      scenePromptHint:
        "grand golden palace throne room, tall pillars, floating crown, magical golden light, king on throne",
    },
  },
];

export const STORY_TEXTS = {
  opening: (name: string) =>
    `פַּעַם, בְּמַמְלָכָה רְחוֹקָה מְאוֹד, {הָיָה יֶלֶד|הָיְתָה יַלְדָּה} בְּשֵׁם ${name}.\nיוֹם אֶחָד, {כְּשֶׁיָּשַׁב בְּחַדְרוֹ וְקָרָא|כְּשֶׁיָּשְׁבָה בְּחַדְרָהּ וְקָרְאָה} סֵפֶר,\nפִּתְאוֹם הִתְחִיל הַסֵּפֶר לִזְהוֹר בְּאוֹר זָהָב! ✨`,
  call: (name: string) =>
    `מִתּוֹךְ הָאוֹר הוֹפִיעָה הוֹדָעָה:\n"${name} {הַיָּקָר|הַיְּקָרָה}, מַמְלֶכֶת הַחִידוֹת בְּסַכָּנָה!\nעֶרְפֵל הַשִּׁכְחָה מִתְפַּשֵּׁט וְגוֹרֵם לַכּוֹל\nלִשְׁכּוֹחַ אֵיךְ לַחְשׁוֹב! 😱\nרַק {יֶלֶד חָכָם|יַלְדָּה חֲכָמָה} בְּמִיוּחָד {יָכוֹל|יְכוֹלָה} לְהַצִּיל אוֹתָנוּ!"`,
  accept: (name: string) =>
    `${name} {לָקַח|לָקְחָה} נְשִׁימָה עֲמוּקָה, {חִיֵּךְ|חִיְּכָה}, {וְקָפַץ|וְקָפְצָה} לְתוֹךְ הַסֵּפֶר הַזּוֹהֵר...\n\n🌟 הַהַרְפַּתְקָאָה מַתְחִילָה! 🌟`,
};
