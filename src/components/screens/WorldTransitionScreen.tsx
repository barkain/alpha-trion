import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS } from "../../config";
import { playSound } from "../../services/soundManager";
import { resolveGender } from "../../utils/helpers";
import styles from "./screens.module.css";

export function WorldTransitionScreen() {
  const { currentWorldIndex, playerName, playerGender, setScreen } = useGameStore();
  const [phase, setPhase] = useState(0);

  const world = WORLDS[currentWorldIndex];
  const char = CHARACTERS[world.characterId];
  const narrative = char.transitionNarrative;

  // Auto-advance phase 0 after 2.5s
  useEffect(() => {
    if (phase === 0) {
      playSound("unlock");
      const timer = setTimeout(() => setPhase(1), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleTap = () => {
    if (phase === 0) return; // auto-advance only
    if (phase === 1) {
      setPhase(2);
    } else if (phase === 2) {
      // Go to map, hero walk will trigger there
      setScreen("map");
    }
  };

  if (!narrative) {
    setScreen("map");
    return null;
  }

  const nameText = (text: string) =>
    resolveGender(text.replace("{name}", playerName), playerGender);

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleTap}
      style={{ cursor: phase > 0 ? "pointer" : "default" }}
    >
      <AnimatePresence mode="wait">
        {/* Phase 0: Restoration reveal */}
        {phase === 0 && (
          <motion.div
            key="phase0"
            className={styles.transitionCard}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={styles.transitionEmoji}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            >
              {narrative.restoredEmoji}
            </motion.div>
            <p className={styles.transitionText}>
              {narrative.saved}
            </p>
          </motion.div>
        )}

        {/* Phase 1: Character farewell */}
        {phase === 1 && (
          <motion.div
            key="phase1"
            className={styles.transitionCard}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {char.emoji}
            </motion.span>
            <p className={styles.transitionText}>
              {nameText(narrative.gratitude)}
            </p>
            <p className={styles.transitionTap}>
              לְחַץ לְהַמְשִׁיךְ
            </p>
          </motion.div>
        )}

        {/* Phase 2: Handoff to next world */}
        {phase === 2 && (
          <motion.div
            key="phase2"
            className={styles.transitionCard}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {currentWorldIndex + 1 < WORLDS.length && (
              <motion.span
                style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {CHARACTERS[WORLDS[currentWorldIndex + 1].characterId].emoji}
              </motion.span>
            )}
            <p className={styles.transitionText}>
              {resolveGender(narrative.handoff, playerGender)}
            </p>
            <motion.button
              className={styles.goldBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setScreen("map");
              }}
            >
              🗺️ לַמַּפָּה!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
