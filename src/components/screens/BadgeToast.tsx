import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { BADGES } from "../../config";
import { playSound } from "../../services/soundManager";
import styles from "./screens.module.css";

export function BadgeToast() {
  const pendingBadgeToast = useGameStore((s) => s.pendingBadgeToast);
  const dismissBadgeToast = useGameStore((s) => s.dismissBadgeToast);

  const badge = BADGES.find((b) => b.id === pendingBadgeToast);

  useEffect(() => {
    if (badge) {
      playSound("unlock");
      const timer = setTimeout(dismissBadgeToast, 3500);
      return () => clearTimeout(timer);
    }
  }, [badge, dismissBadgeToast]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className={styles.badgeToast}
          initial={{ y: -80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={dismissBadgeToast}
        >
          <span className={styles.badgeToastEmoji}>{badge.emoji}</span>
          <div className={styles.badgeToastContent}>
            <div className={styles.badgeToastTitle}>{badge.name}</div>
            <div className={styles.badgeToastDesc}>{badge.description}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
