import type { LeaderboardEntry } from "../types";

const STORAGE_KEY = "alpha-trion-leaderboard";
const MAX_ENTRIES = 20;

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: LeaderboardEntry[] = JSON.parse(raw);
    return entries.sort((a, b) => b.totalScore - a.totalScore);
  } catch {
    return [];
  }
}

export function addEntry(entry: LeaderboardEntry): void {
  const entries = getLeaderboard();
  entries.push(entry);
  entries.sort((a, b) => b.totalScore - a.totalScore);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}
