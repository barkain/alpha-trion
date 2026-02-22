// ── Core domain types ──

export type CategoryId = "math" | "symbols" | "words" | "patterns";

export type Difficulty = "easy" | "medium" | "hard";

export type ScreenId =
  | "nameInput"
  | "story"
  | "map"
  | "charIntro"
  | "loading"
  | "question"
  | "levelComplete"
  | "gameComplete"
  | "worldTransition";

export type CharacterId = "zohar" | "nurit" | "daniel" | "miri" | "king";

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  emoji: string;
  color: string;
  personality: string;
  greeting: string;
  correctResponses: string[];
  wrongResponses: string[];
  storyIntro: string;
  loadingMessages: string[];
  transitionNarrative?: {
    saved: string;
    gratitude: string;
    handoff: string;
    restoredEmoji: string;
  };
}

export interface World {
  id: number;
  name: string;
  emoji: string;
  characterId: CharacterId;
  categories: CategoryId[];
  questionsNeeded: number;
  difficultyMix: Record<Difficulty, number>;
  scene: WorldSceneConfig;
}

export interface WorldSceneConfig {
  /** Base color palette for procedural generation */
  palette: [string, string, string];
  /** Fog density 0-1 */
  fogDensity: number;
  /** Scene descriptors sent to AI for dynamic object generation */
  scenePromptHint: string;
}

export interface Question {
  q: string;
  opts: string[];
  ans: number; // 0-3
  hint: string;
  cat: CategoryId;
  difficulty?: Difficulty;
}

export interface WorldProgress {
  completed: boolean;
  score: number;
  stars: number; // 0-3
}

// ── AI Scene Generation ──

export interface SceneObject {
  type: "tree" | "rock" | "crystal" | "book" | "tower" | "orb" | "mushroom" | "pillar" | "arch";
  position: [number, number, number];
  scale: number;
  color: string;
  emissive?: string;
  animation?: "float" | "rotate" | "pulse" | "sway";
}

export interface GeneratedScene {
  objects: SceneObject[];
  ambientColor: string;
  fogColor: string;
  groundColor: string;
  description: string;
}
