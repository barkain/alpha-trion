import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS, BADGES } from "../../config";
import { playSound, preloadSounds } from "../../services/soundManager";
import { LeaderboardOverlay } from "./LeaderboardOverlay";
import styles from "./screens.module.css";

const WORLD_POSITIONS = [
  { x: "35%", y: "80%" },
  { x: "65%", y: "65%" },
  { x: "25%", y: "35%" },
  { x: "68%", y: "32%" },
  { x: "50%", y: "12%" },
];

export function MapScreen() {
  const { playerName, totalStars, worldProgress, earnedBadges, soundMuted, toggleMute, enterWorld } = useGameStore();
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const isUnlocked = (idx: number) =>
    idx === 0 || (worldProgress[idx - 1].completed && worldProgress[idx - 1].stars > 0);

  const handleEnterWorld = (idx: number) => {
    preloadSounds();
    playSound("click");
    enterWorld(idx);
  };

  return (
    <motion.div
      className={styles.mapOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Fantasy map background image */}
      <div className={styles.mapBg} />

      {/* Header */}
      <div className={styles.mapHeader}>
        <span className={styles.mapTitleNew}>🗺️ מַפַּת הַמַּמְלָכָה</span>
        <span className={styles.starsBadgeNew}>⭐ {totalStars} | 🦸 {playerName}</span>
        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <span className={styles.earnedBadgesRow}>
            {earnedBadges.map((id) => {
              const badge = BADGES.find((b) => b.id === id);
              return badge ? (
                <span key={id} className={styles.earnedBadgeIcon} title={badge.name}>
                  {badge.emoji}
                </span>
              ) : null;
            })}
          </span>
        )}
        {/* Leaderboard */}
        <button
          className={styles.leaderboardBtn}
          onClick={(e) => {
            e.stopPropagation();
            setLeaderboardOpen(true);
          }}
        >
          🏆
        </button>
        {/* Mute toggle */}
        <button
          className={styles.muteBtn}
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
        >
          {soundMuted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* World Markers — glass medallions over map */}
      {WORLDS.map((world, idx) => {
        const unlocked = isUnlocked(idx);
        const wp = worldProgress[idx];
        const char = CHARACTERS[world.characterId];
        const status = wp.completed ? "completed" : unlocked ? "available" : "locked";
        const pos = WORLD_POSITIONS[idx];

        return (
          <motion.div
            key={idx}
            className={`${styles.mapMarker} ${styles[`marker_${status}`]}`}
            style={{ left: pos.x, top: pos.y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: idx * 0.12,
            }}
            whileHover={unlocked ? { scale: 1.1 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            onClick={() => unlocked && handleEnterWorld(idx)}
          >
            <div className={styles.medallion}>
              <span className={styles.markerEmoji}>{world.emoji}</span>
              {wp.completed && <span className={styles.checkOverlay}>✓</span>}
              {!unlocked && <span className={styles.lockOverlay}>🔒</span>}
            </div>
            <div className={styles.markerLabel}>
              <div className={styles.markerName}>{world.name}</div>
              <div className={styles.markerChar}>
                {char.emoji} {char.name}
              </div>
              {wp.completed && (
                <div className={styles.markerStars}>
                  {"⭐".repeat(wp.stars)}{"☆".repeat(3 - wp.stars)}
                </div>
              )}
              {unlocked && !wp.completed && (
                <div className={styles.markerCta}>לְהַתְחִיל!</div>
              )}
            </div>
          </motion.div>
        );
      })}
      <LeaderboardOverlay open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
    </motion.div>
  );
}
