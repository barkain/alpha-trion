import type { Question, Difficulty } from "../types";
import { WORLDS } from "../config";
import { questionSchema } from "./schemas";
import { z } from "zod";

// ── Types ──

interface BankEntry {
  worldId: number;
  questions: Question[];
}

type QuestionBank = BankEntry[];

// ── State ──

let bank: QuestionBank | null = null;
let loadAttempted = false;

// Track which questions have been used per world (reset on new game)
const usedIndices: Map<number, Set<number>> = new Map();

// ── Public API ──

export async function loadQuestionBank(): Promise<boolean> {
  if (bank) return true;
  if (loadAttempted) return false;
  loadAttempted = true;

  try {
    const res = await fetch("/questions.json");
    if (!res.ok) return false;

    const json: unknown = await res.json();
    if (!Array.isArray(json)) return false;

    const parsed: BankEntry[] = [];
    for (const entry of json) {
      if (
        !entry ||
        typeof entry !== "object" ||
        typeof (entry as Record<string, unknown>).worldId !== "number" ||
        !Array.isArray((entry as Record<string, unknown>).questions)
      )
        continue;

      const questions = z
        .array(questionSchema)
        .safeParse((entry as Record<string, unknown>).questions);
      if (!questions.success) continue;

      const worldId = (entry as Record<string, unknown>).worldId as number;
      const world = WORLDS.find((w) => w.id === worldId);
      if (!world) continue;

      parsed.push({
        worldId,
        questions: questions.data.map((q) => ({
          ...q,
          cat: world.categories[0],
          difficulty: (q.difficulty as Difficulty) ?? "medium",
        })),
      });
    }

    if (parsed.length === 0) return false;
    bank = parsed;
    return true;
  } catch {
    return false;
  }
}

export function getQuestionsFromBank(
  worldId: number,
  count: number,
): Question[] | null {
  if (!bank) return null;

  const entry = bank.find((e) => e.worldId === worldId);
  if (!entry || entry.questions.length === 0) return null;

  // Get or create used set for this world
  if (!usedIndices.has(worldId)) {
    usedIndices.set(worldId, new Set());
  }
  const used = usedIndices.get(worldId)!;

  // If all questions have been used, reset
  if (used.size >= entry.questions.length) {
    used.clear();
  }

  // Pick unused questions, preferring difficulty variety
  const available = entry.questions
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => !used.has(i));

  // Shuffle available questions
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const picked = available.slice(0, count);
  for (const { i } of picked) {
    used.add(i);
  }

  if (picked.length === 0) return null;
  return picked.map(({ q }) => q);
}

export function resetBankUsage(): void {
  usedIndices.clear();
}

export function isBankLoaded(): boolean {
  return bank !== null;
}
