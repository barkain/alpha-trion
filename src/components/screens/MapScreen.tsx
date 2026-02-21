import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS } from "../../config";
import styles from "./screens.module.css";

export function MapScreen() {
  const { playerName, totalStars, worldProgress, enterWorld } = useGameStore();

  const isUnlocked = (idx: number) =>
    idx === 0 || (worldProgress[idx - 1].completed && worldProgress[idx - 1].stars > 0);

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ justifyContent: "flex-start", paddingTop: "2rem" }}
    >
      <h2 className={styles.mapTitle}>🗺️ מַפַּת הַמַּמְלָכָה</h2>
      <p className={styles.mapSubtitle}>עִזְרוּ לַתּוֹשָׁבִים לְגָרֵשׁ אֶת עֶרְפֵל הַשִּׁכְחָה!</p>
      <div className={styles.starsBadge}>⭐ {totalStars} כּוֹכָבִים | 🦸 {playerName}</div>

      <div className={styles.worldsPath}>
        {WORLDS.map((world, idx) => {
          const unlocked = isUnlocked(idx);
          const wp = worldProgress[idx];
          const char = CHARACTERS[world.characterId];
          const status = wp.completed ? "completed" : unlocked ? "available" : "locked";

          return (
            <motion.div key={idx} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}>
              {idx > 0 && (
                <div
                  className={styles.pathLine}
                  style={{
                    background: wp.completed || worldProgress[idx - 1].completed
                      ? "rgba(46,204,113,0.5)"
                      : "rgba(255,255,255,0.15)",
                  }}
                />
              )}
              <motion.div
                className={`${styles.worldNode} ${styles[status]}`}
                whileHover={unlocked ? { x: -8, scale: 1.02 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                onClick={() => unlocked && enterWorld(idx)}
              >
                <span className={styles.worldEmoji}>{world.emoji}</span>
                <div className={styles.worldInfo}>
                  <div className={styles.worldName}>{world.name}</div>
                  <div className={styles.worldCharName}>
                    {char.emoji} {char.name}
                  </div>
                  <div className={styles.worldStatus}>
                    {wp.completed
                      ? `${"⭐".repeat(wp.stars)}${"☆".repeat(3 - wp.stars)} (${wp.score}/${world.questionsNeeded})`
                      : unlocked
                        ? "לְהַתְחִיל הַרְפַּתְקָאָה!"
                        : "🔒 נָעוּל"}
                  </div>
                </div>
                {wp.completed && <span className={styles.worldBadge}>✅</span>}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
