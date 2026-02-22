import { useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { WORLDS, CHARACTERS } from "../config";
import { generateQuestions, generateScene, loadBank, getBankQuestions } from "../services/api";
import { sortByDifficulty } from "../services/questionBank";
import { pickRandom } from "../utils/helpers";

export function useWorldLoader() {
  const {
    currentWorldIndex,
    setQuestions,
    setGeneratedScene,
    setLoading,
    setError,
    setScreen,
  } = useGameStore();

  const loadWorld = useCallback(async () => {
    const world = WORLDS[currentWorldIndex];
    const character = CHARACTERS[world.characterId];

    setLoading(true, pickRandom(character.loadingMessages));
    setScreen("loading");
    setError(null);

    // Try question bank first (instant, no API call)
    await loadBank();
    const bankQuestions = getBankQuestions(world.id, world.questionsNeeded);

    // Scene generation runs in parallel with potential AI question fallback
    const scenePromise = generateScene(world.scene.scenePromptHint, world.scene.palette);

    let questions = bankQuestions;
    if (!questions || questions.length === 0) {
      // Fallback to AI generation
      const [aiQuestions, scene] = await Promise.all([
        generateQuestions(world.categories, world.questionsNeeded),
        scenePromise,
      ]);
      questions = aiQuestions;
      if (questions && questions.length > 0) {
        setQuestions(sortByDifficulty(questions));
        setGeneratedScene(scene);
        setLoading(false);
        setScreen("question");
      } else {
        setLoading(false);
        setError("לא הצלחתי לייצר שאלות. נסו שוב!");
      }
      return;
    }

    // Bank questions found — just wait for scene
    const scene = await scenePromise;
    setQuestions(sortByDifficulty(questions));
    setGeneratedScene(scene);
    setLoading(false);
    setScreen("question");
  }, [currentWorldIndex, setQuestions, setGeneratedScene, setLoading, setError, setScreen]);

  return { loadWorld };
}
