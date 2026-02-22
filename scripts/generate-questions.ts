/**
 * Offline question bank generator.
 * Calls the AI API to pre-generate questions for each world
 * and writes them to public/questions.json.
 *
 * Usage:
 *   npx tsx scripts/generate-questions.ts
 *
 * Requires env vars: VITE_AI_API_KEY (and optionally VITE_AI_BASE_URL, VITE_AI_MODEL)
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Config (inline to avoid importing browser-only modules) ──

type CategoryId = "math" | "symbols" | "words" | "patterns";
type Difficulty = "easy" | "medium" | "hard";

interface WorldDef {
  id: number;
  categories: CategoryId[];
  questionsNeeded: number;
  difficultyMix: Record<Difficulty, number>;
}

const WORLDS: WorldDef[] = [
  { id: 0, categories: ["math"], questionsNeeded: 4, difficultyMix: { easy: 2, medium: 1, hard: 1 } },
  { id: 1, categories: ["symbols"], questionsNeeded: 4, difficultyMix: { easy: 2, medium: 1, hard: 1 } },
  { id: 2, categories: ["words"], questionsNeeded: 4, difficultyMix: { easy: 1, medium: 2, hard: 1 } },
  { id: 3, categories: ["patterns"], questionsNeeded: 4, difficultyMix: { easy: 1, medium: 2, hard: 1 } },
  { id: 4, categories: ["math", "symbols", "words", "patterns"], questionsNeeded: 5, difficultyMix: { easy: 1, medium: 2, hard: 2 } },
];

const QUESTION_PROMPTS: Record<CategoryId, string> = {
  math: `צור {n} שאלות חשבון לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
סוגי שאלות: בעיות מילוליות (חיבור, חיסור, כפל, חילוק), אי-שוויונות, השלמת מספרים.`,
  symbols: `צור {n} חידות סמלים/משוואות עם אימוג׳י לילד בכיתה ב׳ בסגנון מבחן מחוננים.
כל שאלה מכילה 2 משוואות עם סמלים (אימוג׳י) והילד צריך למצוא ערך של סמל מסוים.`,
  words: `צור {n} שאלות יחסי מילים (אנלוגיות) לילד בכיתה ב׳ בסגנון מבחן מחוננים.
פורמט: "מילה1 : מילה2 = ? : מילה3"`,
  patterns: `צור {n} שאלות סדרות וחוקיות מספריות לילד בכיתה ב׳ בסגנון מבחן מחוננים.
סוגים: סדרות מספרים, מספרים בצורות, מציאת חוקיות בין שורות.`,
};

const SYSTEM_PROMPT = `אתה יוצר שאלות למבחן מחוננים לילדי כיתה ב׳ בישראל.
החזר JSON בלבד, ללא markdown, ללא backticks, ללא טקסט נוסף.
הפורמט:
[
  {
    "q": "טקסט השאלה בעברית",
    "opts": ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
    "ans": 0,
    "hint": "רמז קצר",
    "difficulty": "easy" | "medium" | "hard"
  }
]
כללים חשובים:
- ans הוא אינדקס (0-3) של התשובה הנכונה
- ודא שהתשובה הנכונה אכן נכונה
- כתוב בעברית תקנית
- ערבב את מיקום התשובה הנכונה
- כל 4 התשובות צריכות להיות סבירות
- הוסף שדה difficulty לכל שאלה`;

// ── API helpers ──

const API_KEY = process.env.VITE_AI_API_KEY ?? "";
const BASE_URL = process.env.VITE_AI_BASE_URL ?? "";
const MODEL = process.env.VITE_AI_MODEL ?? "";

if (!API_KEY) {
  console.error("Error: VITE_AI_API_KEY environment variable is required");
  process.exit(1);
}

function isAnthropicProvider(): boolean {
  if (API_KEY.startsWith("sk-ant-")) return true;
  if (BASE_URL && /anthropic/i.test(BASE_URL)) return true;
  return false;
}

async function callAI(prompt: string): Promise<string> {
  if (isAnthropicProvider()) {
    const isDirect = API_KEY.startsWith("sk-ant-");
    const baseURL = isDirect ? "https://api.anthropic.com" : BASE_URL.replace(/\/+$/, "");
    const headers: Record<string, string> = isDirect
      ? {
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        }
      : {
          Authorization: `Bearer ${API_KEY}`,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        };

    const res = await fetch(`${baseURL}/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL || "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    if (!text.trim()) throw new Error("Empty response from API");
    return text;
  }

  // OpenAI-compatible
  const baseURL = (BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function extractJson(raw: string): unknown {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parsing error in extractJson:", e, "\nRaw content:", cleaned.slice(0, 200));
    return [];
  }
}

// ── Main ──

interface BankQuestion {
  q: string;
  opts: string[];
  ans: number;
  hint: string;
  difficulty: Difficulty;
}

interface BankEntry {
  worldId: number;
  questions: BankQuestion[];
}

async function generateForWorld(world: WorldDef): Promise<BankEntry> {
  // Generate extra questions (3x needed) for variety
  const totalToGenerate = world.questionsNeeded * 3;

  const difficultyInstruction = Object.entries(world.difficultyMix)
    .map(([d, n]) => `${n * 3} שאלות ברמת "${d}"`)
    .join(", ");

  const catPrompts = world.categories.map((c) =>
    QUESTION_PROMPTS[c].replace("{n}", String(
      world.categories.length > 1
        ? Math.ceil(totalToGenerate / world.categories.length)
        : totalToGenerate,
    )),
  );

  const prompt =
    world.categories.length > 1
      ? `צור ${totalToGenerate} שאלות מעורבות מהנושאים הבאים:\n${catPrompts.join("\n\n")}\n\nהתפלגות קושי: ${difficultyInstruction}`
      : `${catPrompts[0]}\n\nסה"כ ${totalToGenerate} שאלות. התפלגות קושי: ${difficultyInstruction}`;

  console.log(`  Generating ${totalToGenerate} questions for world ${world.id}...`);

  const raw = await callAI(prompt);
  const json = extractJson(raw);

  let arr: unknown[];
  if (Array.isArray(json)) {
    arr = json;
  } else if (json && typeof json === "object") {
    const firstArray = Object.values(json as Record<string, unknown>).find((v) =>
      Array.isArray(v),
    );
    arr = (firstArray as unknown[]) ?? [];
  } else {
    arr = [];
  }

  const questions: BankQuestion[] = arr
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    .map((item) => ({
      q: String(item.q ?? ""),
      opts: Array.isArray(item.opts) ? item.opts.map(String) : [],
      ans: Math.min(Math.max(0, Number(item.ans) || 0), 3),
      hint: String(item.hint ?? ""),
      difficulty: (["easy", "medium", "hard"].includes(String(item.difficulty))
        ? String(item.difficulty)
        : "medium") as Difficulty,
    }))
    .filter((q) => q.q && q.opts.length === 4);

  console.log(`  Got ${questions.length} valid questions for world ${world.id}`);

  return { worldId: world.id, questions };
}

async function main() {
  console.log("Generating question bank...\n");

  const bank: BankEntry[] = [];
  for (const world of WORLDS) {
    try {
      const entry = await generateForWorld(world);
      bank.push(entry);
    } catch (err) {
      console.error(`  Failed for world ${world.id}:`, err);
    }
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, "../public/questions.json");
  writeFileSync(outPath, JSON.stringify(bank, null, 2), "utf-8");
  console.log(`\nWrote ${outPath}`);
  console.log(`Total: ${bank.reduce((s, e) => s + e.questions.length, 0)} questions across ${bank.length} worlds`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
