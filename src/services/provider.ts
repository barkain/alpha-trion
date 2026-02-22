const API_KEY = import.meta.env.VITE_AI_API_KEY ?? "";
const BASE_URL = import.meta.env.VITE_AI_BASE_URL ?? "";
const MODEL_OVERRIDE = import.meta.env.VITE_AI_MODEL ?? "";

type ProviderType = "anthropic" | "openai-compatible";

export interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  model: string;
  baseURL: string;
  headers: Record<string, string>;
}

function detectProvider(): ProviderType {
  // Case 1: Direct Anthropic API key
  if (API_KEY.startsWith("sk-ant-")) return "anthropic";

  // Case 2: Anthropic-format proxy (e.g. z.ai) — URL contains "anthropic"
  if (BASE_URL && /anthropic/i.test(BASE_URL)) return "anthropic";

  // Case 3: Everything else is OpenAI-compatible
  return "openai-compatible";
}

export function getProviderConfig(): ProviderConfig {
  const provider = detectProvider();

  if (provider === "anthropic") {
    const isDirect = API_KEY.startsWith("sk-ant-");

    // Direct Anthropic: x-api-key header + default baseURL
    // Proxy (e.g. z.ai): Bearer auth + user-supplied baseURL
    const baseURL = isDirect
      ? "https://api.anthropic.com"
      : BASE_URL.replace(/\/+$/, "");

    const headers: Record<string, string> = isDirect
      ? {
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "content-type": "application/json",
        }
      : {
          Authorization: `Bearer ${API_KEY}`,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        };

    console.log(
      `[Provider] Anthropic (${isDirect ? "direct" : "proxy"}), baseURL=${baseURL}, model=${MODEL_OVERRIDE || "claude-sonnet-4-6"}`,
    );

    return {
      type: "anthropic",
      apiKey: API_KEY,
      model: MODEL_OVERRIDE || "claude-sonnet-4-6",
      baseURL,
      headers,
    };
  }

  // OpenAI-compatible path
  // Strip trailing slash from baseURL to avoid double-slash in fetch URLs
  // (e.g. if baseURL is "https://api.zed.ai/v1/" we don't want "/v1//chat/completions")
  const rawBase = BASE_URL || "https://api.openai.com/v1";
  const baseURL = rawBase.replace(/\/+$/, "");

  console.log(
    `[Provider] OpenAI-compatible, baseURL=${baseURL}, model=${MODEL_OVERRIDE || "gpt-4o-mini"}`,
  );

  return {
    type: "openai-compatible",
    apiKey: API_KEY,
    model: MODEL_OVERRIDE || "gpt-4o-mini",
    baseURL,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  };
}
