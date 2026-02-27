import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { getLeaderboard } from "../../services/leaderboard";
import styles from "./screens.module.css";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

interface LeaderboardOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function LeaderboardOverlay({ open, onClose }: LeaderboardOverlayProps) {
  const playerName = useGameStore((s) => s.playerName);
  const entries = useMemo(() => (open ? getLeaderboard() : []), [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.leaderboardBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.leaderboardCard}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.leaderboardHeader}>
              <span style={{ fontSize: "1.6rem" }}>🏆</span>
              <h2 className={styles.leaderboardTitle}>לוּחַ תוֹצָאוֹת</h2>
              <button className={styles.leaderboardClose} onClick={onClose}>✕</button>
            </div>

            {entries.length === 0 ? (
              <p className={styles.leaderboardEmpty}>עוֹד אֵין תוֹצָאוֹת — סַיֵּם מִשְׂחָק כְּדֵי לְהוֹפִיעַ כָּאן!</p>
            ) : (
              <div className={styles.leaderboardList}>
                {entries.map((entry, i) => {
                  const isCurrentPlayer = entry.playerName === playerName;
                  return (
                    <div
                      key={i}
                      className={`${styles.leaderboardRow} ${isCurrentPlayer ? styles.leaderboardRowHighlight : ""}`}
                    >
                      <span className={styles.leaderboardRank}>
                        {i < 3 ? RANK_MEDALS[i] : i + 1}
                      </span>
                      <span className={styles.leaderboardName}>{entry.playerName}</span>
                      <span className={styles.leaderboardScore}>{entry.totalScore}</span>
                      <span className={styles.leaderboardStars}>⭐ {entry.totalStars}</span>
                      <span className={styles.leaderboardDate}>
                        {new Date(entry.date).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
