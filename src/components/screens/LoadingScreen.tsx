import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS } from "../../config";
import { useWorldLoader } from "../../hooks/useWorldLoader";
import styles from "./screens.module.css";

export function LoadingScreen() {
  const { currentWorldIndex, loadingMessage, error, setScreen } = useGameStore();
  const { loadWorld } = useWorldLoader();

  const world = WORLDS[currentWorldIndex];
  const char = CHARACTERS[world.characterId];

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={styles.bigEmoji}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: "4rem" }}
      >
        {char.emoji}
      </motion.div>

      {!error && (
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

      <motion.p
        className={styles.loadingText}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {loadingMessage}
      </motion.p>

      <p className={styles.loadingSub}>
        {world.emoji} {world.name}
      </p>

      {error && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <p style={{ color: "#e74c3c", marginBottom: "1rem" }}>{error}</p>
          <button className={styles.retryBtn} onClick={loadWorld}>
            🔄 נסה שוב
          </button>
          <button
            className={styles.retryBtn}
            style={{ marginTop: "0.5rem" }}
            onClick={() => setScreen("map")}
          >
            → חזרה למפה
          </button>
        </div>
      )}
    </motion.div>
  );
}
