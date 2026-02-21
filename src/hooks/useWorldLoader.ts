import { useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { WORLDS, CHARACTERS } from "../config";
import { generateQuestions, generateScene } from "../services/api";
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

    // Run question generation and scene generation in parallel
    const [questions, scene] = await Promise.all([
      generateQuestions(world.categories, world.questionsNeeded),
      generateScene(world.scene.scenePromptHint, world.scene.palette),
    ]);

    if (questions && questions.length > 0) {
      setQuestions(questions);
      setGeneratedScene(scene); // scene can be null, fallback handled in 3D layer
      setLoading(false);
      setScreen("question");
    } else {
      setLoading(false);
      setError("לא הצלחתי לייצר שאלות. נסו שוב!");
    }
  }, [currentWorldIndex, setQuestions, setGeneratedScene, setLoading, setError, setScreen]);

  return { loadWorld };
}
