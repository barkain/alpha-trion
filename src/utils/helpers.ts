import type { Gender } from "../types";

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Guess gender from a Hebrew name based on common suffixes. */
export function guessGender(name: string): Gender {
  const trimmed = name.trim();
  if (!trimmed) return "male";

  // Common female suffixes in Hebrew
  if (trimmed.endsWith("ית") || trimmed.endsWith("ת")) return "female";
  // Names ending in ה are often female (שרה, רינה, דינה, טליה)
  // Exclude common male names ending in ה
  const maleWithHe = ["משה", "משֶׁה", "מֹשֶׁה"];
  if (trimmed.endsWith("ה") && !maleWithHe.includes(trimmed)) return "female";
  if (trimmed.endsWith("הּ")) return "female";

  return "male";
}

/**
 * Resolve gendered text templates.
 * Pattern: {male variant|female variant}
 * Example: "שֶׁ{אַתָּה|אַתְּ} {אַלּוּף|אַלּוּפָה}" → "שֶׁאַתְּ אַלּוּפָה" (female)
 */
export function resolveGender(text: string, gender: Gender): string {
  return text.replace(/\{([^|}]+)\|([^}]+)\}/g, (_, male, female) =>
    gender === "female" ? female : male,
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function interpolateColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}
