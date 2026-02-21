import { create } from "zustand";
import type {
  ScreenId,
  WorldProgress,
  Question,
  GeneratedScene,
} from "../types";
import { WORLDS, DIFFICULTY_POINTS } from "../config";

interface GameState {
  // Player
  playerName: string;
  setPlayerName: (name: string) => void;

  // Navigation
  screen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  storyStep: number;
  setStoryStep: (step: number) => void;
  advanceStory: () => void;

  // World
  currentWorldIndex: number;
  worldProgress: WorldProgress[];
  totalStars: number;
  enterWorld: (index: number) => void;

  // Gameplay
  lives: number;
  correctInWorld: number;
  scoreInWorld: number;
  questions: Question[];
  currentQuestionIndex: number;
  selectedOption: number | null;
  answered: boolean;
  showHint: boolean;

  setQuestions: (qs: Question[]) => void;
  answerQuestion: (optionIndex: number) => void;
  nextQuestion: () => void;
  toggleHint: () => void;

  // 3D Scene
  generatedScene: GeneratedScene | null;
  setGeneratedScene: (scene: GeneratedScene | null) => void;
  fogStrength: number; // 0-1, decreases as player succeeds
  updateFogStrength: () => void;

  // Loading
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;

  // Reset
  resetGame: () => void;
}

const initialWorldProgress = (): WorldProgress[] =>
  WORLDS.map(() => ({ completed: false, score: 0, stars: 0 }));

export const useGameStore = create<GameState>((set, get) => ({
  // Player
  playerName: "",
  setPlayerName: (name) => set({ playerName: name }),

  // Navigation
  screen: "nameInput",
  setScreen: (screen) => set({ screen }),
  storyStep: 0,
  setStoryStep: (step) => set({ storyStep: step }),
  advanceStory: () => {
    const { storyStep } = get();
    if (storyStep < 2) {
      set({ storyStep: storyStep + 1 });
    } else {
      set({ screen: "map" });
    }
  },

  // World
  currentWorldIndex: 0,
  worldProgress: initialWorldProgress(),
  totalStars: 0,
  enterWorld: (index) =>
    set({
      currentWorldIndex: index,
      currentQuestionIndex: 0,
      selectedOption: null,
      showHint: false,
      correctInWorld: 0,
      scoreInWorld: 0,
      answered: false,
      lives: 3,
      error: null,
      generatedScene: null,
      fogStrength: 1,
      screen: "charIntro",
    }),

  // Gameplay
  lives: 3,
  correctInWorld: 0,
  scoreInWorld: 0,
  questions: [],
  currentQuestionIndex: 0,
  selectedOption: null,
  answered: false,
  showHint: false,

  setQuestions: (qs) => set({ questions: qs }),

  answerQuestion: (optionIndex) => {
    const { questions, currentQuestionIndex, answered } = get();
    if (answered) return;

    const q = questions[currentQuestionIndex];
    const isCorrect = optionIndex === q.ans;
    const points = isCorrect
      ? DIFFICULTY_POINTS[q.difficulty ?? "medium"]
      : 0;
    set((state) => ({
      selectedOption: optionIndex,
      answered: true,
      correctInWorld: isCorrect
        ? state.correctInWorld + 1
        : state.correctInWorld,
      scoreInWorld: state.scoreInWorld + points,
      lives: isCorrect ? state.lives : state.lives - 1,
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions, lives, correctInWorld, scoreInWorld, currentWorldIndex, worldProgress } = get();

    if (currentQuestionIndex + 1 >= questions.length || lives <= 0) {
      // Level complete
      const world = WORLDS[currentWorldIndex];
      const pct = correctInWorld / world.questionsNeeded;
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;

      const newProgress = [...worldProgress];
      newProgress[currentWorldIndex] = { completed: true, score: scoreInWorld, stars };
      const newTotalStars = newProgress.reduce((s, w) => s + w.stars, 0);

      const isFinalWorld = currentWorldIndex === WORLDS.length - 1 && stars > 0;

      set({
        worldProgress: newProgress,
        totalStars: newTotalStars,
        screen: isFinalWorld ? "gameComplete" : "levelComplete",
      });
    } else {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        selectedOption: null,
        showHint: false,
        answered: false,
      });
    }
  },

  toggleHint: () => set((s) => ({ showHint: !s.showHint })),

  // 3D Scene
  generatedScene: null,
  setGeneratedScene: (scene) => set({ generatedScene: scene }),
  fogStrength: 1,
  updateFogStrength: () => {
    const { correctInWorld, currentWorldIndex } = get();
    const world = WORLDS[currentWorldIndex];
    const cleared = correctInWorld / world.questionsNeeded;
    set({ fogStrength: Math.max(0, 1 - cleared) });
  },

  // Loading
  isLoading: false,
  loadingMessage: "",
  error: null,
  setLoading: (loading, message = "") => set({ isLoading: loading, loadingMessage: message }),
  setError: (error) => set({ error }),

  // Reset
  resetGame: () =>
    set({
      worldProgress: initialWorldProgress(),
      totalStars: 0,
      screen: "map",
      generatedScene: null,
      fogStrength: 1,
    }),
}));
