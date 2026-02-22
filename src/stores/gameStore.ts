import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ScreenId,
  WorldProgress,
  Question,
  GeneratedScene,
  Gender,
} from "../types";
import { WORLDS, DIFFICULTY_POINTS } from "../config";
import { playSound } from "../services/soundManager";

interface GameState {
  // Player
  playerName: string;
  playerGender: Gender;
  setPlayerName: (name: string) => void;
  setPlayerGender: (gender: Gender) => void;

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

  // Streak / Combo
  streak: number;
  maxStreak: number;
  lastStreakMultiplier: number;

  // Speed bonus
  questionStartTime: number;
  lastSpeedBonus: number;

  // Badges
  earnedBadges: string[];
  pendingBadgeToast: string | null;
  dismissBadgeToast: () => void;

  // Hero
  heroWorldIndex: number;
  heroAnimating: boolean;
  heroAnimationProgress: number;
  setHeroAnimating: (animating: boolean) => void;
  setHeroAnimationProgress: (progress: number) => void;

  // Sound
  soundMuted: boolean;
  toggleMute: () => void;

  // 3D Scene
  generatedScene: GeneratedScene | null;
  setGeneratedScene: (scene: GeneratedScene | null) => void;
  fogStrength: number;
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

function checkAndAwardBadges(state: GameState): Partial<GameState> {
  const newBadges = [...state.earnedBadges];
  let pending: string | null = null;

  const check = (id: string, condition: boolean) => {
    if (condition && !newBadges.includes(id)) {
      newBadges.push(id);
      pending = id;
    }
  };

  // First world completed
  check("firstWorld", state.worldProgress.some((w) => w.completed));

  // Perfect score (3 stars) in any world
  check("perfectScore", state.worldProgress.some((w) => w.stars === 3));

  // Streak of 3+
  check("streak3", state.maxStreak >= 3);

  // 10+ total stars
  check("allStars", state.totalStars >= 10);

  // Speed demon — checked via lastSpeedBonus (awarded in answerQuestion)
  check("speedDemon", state.lastSpeedBonus >= 10);

  // Kingdom hero — all 5 worlds completed with stars
  check(
    "kingdomHero",
    state.worldProgress.every((w) => w.completed && w.stars > 0),
  );

  if (newBadges.length === state.earnedBadges.length) return {};
  return { earnedBadges: newBadges, pendingBadgeToast: pending };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Player
      playerName: "",
      playerGender: "male" as Gender,
      setPlayerName: (name) => set({ playerName: name }),
      setPlayerGender: (gender) => set({ playerGender: gender }),

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
          streak: 0,
          lastStreakMultiplier: 1,
          lastSpeedBonus: 0,
          questionStartTime: 0,
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

      setQuestions: (qs) => set({ questions: qs, questionStartTime: Date.now() }),

      answerQuestion: (optionIndex) => {
        const { questions, currentQuestionIndex, answered, streak, maxStreak, questionStartTime } = get();
        if (answered) return;

        const q = questions[currentQuestionIndex];
        const isCorrect = optionIndex === q.ans;

        // Streak
        const newStreak = isCorrect ? streak + 1 : 0;
        const multiplier = newStreak >= 3 ? 2 : newStreak >= 2 ? 1.5 : 1;
        const newMaxStreak = Math.max(maxStreak, newStreak);

        // Speed bonus (correct only)
        let speedBonus = 0;
        if (isCorrect && questionStartTime > 0) {
          const elapsed = (Date.now() - questionStartTime) / 1000;
          if (elapsed <= 10) speedBonus = 10;
          else if (elapsed <= 15) speedBonus = 5;
        }

        // Points
        const basePoints = isCorrect
          ? DIFFICULTY_POINTS[q.difficulty ?? "medium"]
          : 0;
        const points = Math.round(basePoints * multiplier) + speedBonus;

        // Sound
        if (isCorrect) {
          if (newStreak >= 2) playSound("streak");
          else playSound("correct");
        } else {
          playSound("wrong");
        }

        set((state) => {
          const updated = {
            ...state,
            selectedOption: optionIndex,
            answered: true,
            correctInWorld: isCorrect
              ? state.correctInWorld + 1
              : state.correctInWorld,
            scoreInWorld: state.scoreInWorld + points,
            lives: isCorrect ? state.lives : state.lives - 1,
            streak: newStreak,
            maxStreak: newMaxStreak,
            lastStreakMultiplier: multiplier,
            lastSpeedBonus: speedBonus,
          };
          return { ...updated, ...checkAndAwardBadges(updated as GameState) };
        });
      },

      nextQuestion: () => {
        const { currentQuestionIndex, questions, lives, correctInWorld, scoreInWorld, currentWorldIndex, worldProgress } = get();

        if (currentQuestionIndex + 1 >= questions.length || lives <= 0) {
          // Level complete
          const world = WORLDS[currentWorldIndex];
          const pct = correctInWorld / world.questionsNeeded;
          const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;

          const newProgress = [...worldProgress];
          const prev = newProgress[currentWorldIndex];
          // Best-score preservation
          newProgress[currentWorldIndex] = {
            completed: true,
            score: Math.max(prev.score, scoreInWorld),
            stars: Math.max(prev.stars, stars),
          };
          const newTotalStars = newProgress.reduce((s, w) => s + w.stars, 0);

          const isFinalWorld = currentWorldIndex === WORLDS.length - 1 && stars > 0;

          playSound("levelUp");

          // Update heroWorldIndex to the furthest completed world + 1
          const furthest = newProgress.reduce(
            (max, w, i) => (w.completed && w.stars > 0 && i + 1 > max ? i + 1 : max),
            0,
          );

          set((state) => {
            const updated = {
              ...state,
              worldProgress: newProgress,
              totalStars: newTotalStars,
              heroWorldIndex: Math.min(furthest, WORLDS.length - 1),
              screen: (isFinalWorld ? "gameComplete" : "levelComplete") as ScreenId,
            };
            return { ...updated, ...checkAndAwardBadges(updated as GameState) };
          });
        } else {
          set({
            currentQuestionIndex: currentQuestionIndex + 1,
            selectedOption: null,
            showHint: false,
            answered: false,
            questionStartTime: Date.now(),
          });
        }
      },

      toggleHint: () => set((s) => ({ showHint: !s.showHint })),

      // Streak / Combo
      streak: 0,
      maxStreak: 0,
      lastStreakMultiplier: 1,

      // Speed bonus
      questionStartTime: 0,
      lastSpeedBonus: 0,

      // Badges
      earnedBadges: [],
      pendingBadgeToast: null,
      dismissBadgeToast: () => set({ pendingBadgeToast: null }),

      // Hero
      heroWorldIndex: 0,
      heroAnimating: false,
      heroAnimationProgress: 0,
      setHeroAnimating: (animating) => set({ heroAnimating: animating }),
      setHeroAnimationProgress: (progress) => set({ heroAnimationProgress: progress }),

      // Sound
      soundMuted: false,
      toggleMute: () => {
        const { soundMuted } = get();
        const newMuted = !soundMuted;
        import("../services/soundManager").then(({ setMuted }) => setMuted(newMuted));
        set({ soundMuted: newMuted });
      },

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
      resetGame: () => {
        localStorage.removeItem("alpha-trion-game");
        set({
          playerName: "",
          playerGender: "male" as Gender,
          worldProgress: initialWorldProgress(),
          totalStars: 0,
          earnedBadges: [],
          heroWorldIndex: 0,
          screen: "nameInput",
          generatedScene: null,
          fogStrength: 1,
        });
      },
    }),
    {
      name: "alpha-trion-game",
      version: 1,
      partialize: (state) => ({
        playerName: state.playerName,
        playerGender: state.playerGender,
        worldProgress: state.worldProgress,
        totalStars: state.totalStars,
        earnedBadges: state.earnedBadges,
        heroWorldIndex: state.heroWorldIndex,
        soundMuted: state.soundMuted,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.playerName) {
          state.screen = "map";
          // Sync muted state
          if (state.soundMuted) {
            import("../services/soundManager").then(({ setMuted }) => setMuted(true));
          }
        }
      },
    },
  ),
);
