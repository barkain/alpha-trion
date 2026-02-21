import type { CategoryId, Question, GeneratedScene, Difficulty } from "../types";
import { loadQuestionBank, getQuestionsFromBank } from "./questionBank";
import {
  QUESTION_PROMPTS,
  QUESTION_SYSTEM_PROMPT,
  SCENE_SYSTEM_PROMPT,
} from "../config";
import { getProviderConfig } from "./provider";
import type { ProviderConfig } from "./provider";
import { questionSchema, generatedSceneSchema } from "./schemas";
import { z } from "zod";

// ── Raw fetch helpers ──

async function chatCompletion(
  config: ProviderConfig,
  system: string,
  prompt: string,
  maxTokens: number,
): Promise<string> {
  if (config.type === "anthropic") {
    const res = await fetch(`${config.baseURL}/v1/messages`, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    console.log("[AI Debug] raw response:", JSON.stringify(data, null, 2));

    const textBlock = data.content?.find(
      (b: { type: string }) => b.type === "text",
    );
    const text = textBlock?.text ?? "";

    if (!text.trim()) {
      throw new Error(
        `[AI Debug] Anthropic returned empty text content. Full response: ${JSON.stringify(data)}`,
      );
    }

    return text;
  }

  // OpenAI-compatible path
  const res = await fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      model: config.model,
      // For openai.com: omit token limit entirely — reasoning models (e.g. gpt-5-mini)
      // use max_completion_tokens for BOTH reasoning + output, leaving no room for content.
      // For other OpenAI-compatible providers: send max_tokens as usual.
      ...(!config.baseURL.includes("openai.com") && { max_tokens: maxTokens }),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  console.log("[AI Debug] raw response:", JSON.stringify(data, null, 2));

  const text = data.choices?.[0]?.message?.content ?? "";

  if (!text.trim()) {
    throw new Error(
      `[AI Debug] OpenAI-compatible endpoint returned empty content. Full response: ${JSON.stringify(data)}`,
    );
  }

  return text;
}

function extractJson(raw: string): unknown {
  if (!raw || !raw.trim()) {
    throw new Error(
      "[AI Debug] extractJson called with empty/whitespace input — the AI returned no content",
    );
  }

  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

// ── Public API ──

export async function loadBank(): Promise<boolean> {
  return loadQuestionBank();
}

export function getBankQuestions(
  worldId: number,
  count: number,
): Question[] | null {
  return getQuestionsFromBank(worldId, count);
}

export async function generateQuestions(
  categories: CategoryId[],
  count: number,
  difficulties?: Difficulty[],
): Promise<Question[] | null> {
  const catPrompts = categories.map((c) =>
    QUESTION_PROMPTS[c].replace(
      "{n}",
      String(
        categories.length > 1
          ? Math.ceil(count / categories.length)
          : count,
      ),
    ),
  );

  const prompt =
    categories.length > 1
      ? `צור ${count} שאלות מעורבות מהנושאים הבאים:\n${catPrompts.join("\n\n")}`
      : catPrompts[0];

  try {
    const config = getProviderConfig();
    const raw = await chatCompletion(
      config,
      QUESTION_SYSTEM_PROMPT,
      prompt,
      1500,
    );

    const json = extractJson(raw);

    // The response might be an array directly or { questions: [...] }, { items: [...] }, etc.
    // If it's an object, find the first property whose value is an array.
    let arr: unknown;
    if (Array.isArray(json)) {
      arr = json;
    } else if (json && typeof json === "object") {
      const firstArray = Object.values(json as Record<string, unknown>).find(
        (v) => Array.isArray(v),
      );
      arr = firstArray ?? json;
    } else {
      arr = json;
    }

    const parsed = z.array(questionSchema).parse(arr);

    return parsed.slice(0, count).map((q, i) => ({
      ...q,
      cat:
        categories.length > 1
          ? categories[i % categories.length]
          : categories[0],
      ans: Math.min(Math.max(0, q.ans), 3),
      difficulty: (q.difficulty as Difficulty) ?? (difficulties?.[i % (difficulties?.length ?? 1)] ?? "medium"),
    }));
  } catch (err) {
    console.error("Failed to generate questions:", err);
    return null;
  }
}

export async function generateScene(
  sceneHint: string,
  palette: [string, string, string],
): Promise<GeneratedScene | null> {
  const prompt = `Generate a 3D scene for a children's educational game:
Scene: ${sceneHint}
Color palette: ${palette.join(", ")}
Make it magical, kid-friendly, with glowing elements.`;

  try {
    const config = getProviderConfig();
    const raw = await chatCompletion(
      config,
      SCENE_SYSTEM_PROMPT,
      prompt,
      2000,
    );

    const json = extractJson(raw);
    return generatedSceneSchema.parse(json);
  } catch (err) {
    console.error("Failed to generate scene:", err);
    return getFallbackScene(palette);
  }
}

/** Fallback scene if AI generation fails */
function getFallbackScene(
  palette: [string, string, string],
): GeneratedScene {
  return {
    objects: [
      {
        type: "tree",
        position: [-3, 0, -2],
        scale: 1.5,
        color: palette[1],
        animation: "sway",
      },
      {
        type: "tree",
        position: [4, 0, -3],
        scale: 1.2,
        color: palette[1],
        animation: "sway",
      },
      {
        type: "tree",
        position: [-5, 0, 1],
        scale: 1.8,
        color: palette[0],
        animation: "sway",
      },
      { type: "rock", position: [2, 0, 2], scale: 0.8, color: "#666" },
      { type: "rock", position: [-1, 0, 3], scale: 0.5, color: "#777" },
      {
        type: "mushroom",
        position: [0, 0, -1],
        scale: 0.6,
        color: "#ff6b6b",
        emissive: "#ff3333",
        animation: "pulse",
      },
      {
        type: "mushroom",
        position: [3, 0, 1],
        scale: 0.4,
        color: "#ffd93d",
        emissive: "#ffaa00",
        animation: "pulse",
      },
      {
        type: "orb",
        position: [-2, 2, 0],
        scale: 0.3,
        color: "#FFD700",
        emissive: "#FFD700",
        animation: "float",
      },
      {
        type: "orb",
        position: [1, 3, -2],
        scale: 0.2,
        color: "#9B59B6",
        emissive: "#9B59B6",
        animation: "float",
      },
      {
        type: "crystal",
        position: [5, 0, -1],
        scale: 0.7,
        color: "#3498DB",
        emissive: "#2980B9",
        animation: "rotate",
      },
    ],
    ambientColor: palette[0],
    fogColor: palette[2],
    groundColor: palette[0],
    description: "A magical scene with glowing elements",
  };
}
