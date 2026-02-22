import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { STORY_TEXTS } from "../../config";
import { resolveGender } from "../../utils/helpers";
import styles from "./screens.module.css";

const STORY_EMOJIS = ["📖", "😱", "🌟"];

export function StoryScreen() {
  const { storyStep, advanceStory, playerName, playerGender } = useGameStore();

  const storyTexts = [
    resolveGender(STORY_TEXTS.opening(playerName), playerGender),
    resolveGender(STORY_TEXTS.call(playerName), playerGender),
    resolveGender(STORY_TEXTS.accept(playerName), playerGender),
  ];

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={storyStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <motion.div
            className={styles.bigEmoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {STORY_EMOJIS[storyStep]}
          </motion.div>

          <div className={styles.storyCard}>
            <p className={styles.storyText}>{storyTexts[storyStep]}</p>
            <motion.button
              className={styles.goldBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={advanceStory}
            >
              {storyStep < 2 ? "הַמְשֵׁךְ..." : "🗺️ לַמַּפָּה!"}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
