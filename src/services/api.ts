import type { CategoryId, Question, GeneratedScene } from "../types";
import {
  QUESTION_PROMPTS,
  QUESTION_SYSTEM_PROMPT,
  SCENE_SYSTEM_PROMPT,
} from "../config";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(
  system: string,
  userMessage: string,
  maxTokens = 1500,
): Promise<string | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const text =
      data.content
        ?.map((b: { type: string; text?: string }) =>
          b.type === "text" ? b.text : "",
        )
        .join("") || "";
    return text.replace(/```json|```/g, "").trim();
  } catch (err) {
    console.error("API call failed:", err);
    return null;
  }
}

export async function generateQuestions(
  categories: CategoryId[],
  count: number,
): Promise<Question[] | null> {
  const catPrompts = categories.map((c) =>
    QUESTION_PROMPTS[c].replace(
      "{n}",
      String(categories.length > 1 ? Math.ceil(count / categories.length) : count),
    ),
  );

  const userPrompt =
    categories.length > 1
      ? `צור ${count} שאלות מעורבות מהנושאים הבאים:\n${catPrompts.join("\n\n")}`
      : catPrompts[0];

  const raw = await callClaude(QUESTION_SYSTEM_PROMPT, userPrompt);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Array<{
      q: string;
      opts: string[];
      ans: number;
      hint: string;
    }>;

    return parsed.slice(0, count).map((q, i) => ({
      ...q,
      cat: categories.length > 1 ? categories[i % categories.length] : categories[0],
      ans: Math.min(Math.max(0, q.ans), 3),
    }));
  } catch (err) {
    console.error("Failed to parse questions:", err);
    return null;
  }
}

export async function generateScene(
  sceneHint: string,
  palette: [string, string, string],
): Promise<GeneratedScene | null> {
  const userPrompt = `Generate a 3D scene for a children's educational game:
Scene: ${sceneHint}
Color palette: ${palette.join(", ")}
Make it magical, kid-friendly, with glowing elements.`;

  const raw = await callClaude(SCENE_SYSTEM_PROMPT, userPrompt, 2000);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GeneratedScene;
  } catch (err) {
    console.error("Failed to parse scene:", err);
    return getFallbackScene(palette);
  }
}

/** Fallback scene if AI generation fails */
function getFallbackScene(palette: [string, string, string]): GeneratedScene {
  return {
    objects: [
      { type: "tree", position: [-3, 0, -2], scale: 1.5, color: palette[1], animation: "sway" },
      { type: "tree", position: [4, 0, -3], scale: 1.2, color: palette[1], animation: "sway" },
      { type: "tree", position: [-5, 0, 1], scale: 1.8, color: palette[0], animation: "sway" },
      { type: "rock", position: [2, 0, 2], scale: 0.8, color: "#666" },
      { type: "rock", position: [-1, 0, 3], scale: 0.5, color: "#777" },
      { type: "mushroom", position: [0, 0, -1], scale: 0.6, color: "#ff6b6b", emissive: "#ff3333", animation: "pulse" },
      { type: "mushroom", position: [3, 0, 1], scale: 0.4, color: "#ffd93d", emissive: "#ffaa00", animation: "pulse" },
      { type: "orb", position: [-2, 2, 0], scale: 0.3, color: "#FFD700", emissive: "#FFD700", animation: "float" },
      { type: "orb", position: [1, 3, -2], scale: 0.2, color: "#9B59B6", emissive: "#9B59B6", animation: "float" },
      { type: "crystal", position: [5, 0, -1], scale: 0.7, color: "#3498DB", emissive: "#2980B9", animation: "rotate" },
    ],
    ambientColor: palette[0],
    fogColor: palette[2],
    groundColor: palette[0],
    description: "A magical scene with glowing elements",
  };
}
