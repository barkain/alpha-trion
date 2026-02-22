import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS } from "../../config";
import { useWorldLoader } from "../../hooks/useWorldLoader";
import { resolveGender } from "../../utils/helpers";
import styles from "./screens.module.css";

export function CharIntroScreen() {
  const { currentWorldIndex, playerName, playerGender } = useGameStore();
  const { loadWorld } = useWorldLoader();

  const world = WORLDS[currentWorldIndex];
  const char = CHARACTERS[world.characterId];
  const isFemale = playerGender === "female";

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={styles.bigEmoji}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: "5rem" }}
      >
        {char.emoji}
      </motion.div>

      <h2 className={styles.charName} style={{ color: char.color }}>
        {char.name}
      </h2>

      <motion.div
        className={styles.storyCard}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ maxWidth: 500 }}
      >
        <p className={styles.storyText} style={{ fontSize: "1rem" }}>
          {resolveGender(char.storyIntro, playerGender)}
        </p>
      </motion.div>

      <motion.div
        className={styles.speechBubble}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ borderColor: char.color + "55" }}
      >
        <p className={styles.speechText}>
          {resolveGender(char.greeting.replace(/{name}/g, playerName), playerGender)}
        </p>
      </motion.div>

      <motion.button
        className={styles.goldBtn}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={loadWorld}
        style={{ marginTop: "1.5rem" }}
      >
        {isFemale ? "💪 בּוֹאִי נַתְחִיל!" : "💪 בּוֹא נַתְחִיל!"}
      </motion.button>
    </motion.div>
  );
}
