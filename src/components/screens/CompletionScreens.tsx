import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS } from "../../config";
import styles from "./screens.module.css";

export function LevelCompleteScreen() {
  const { currentWorldIndex, correctInWorld, scoreInWorld, worldProgress, playerName, setScreen } =
    useGameStore();

  const world = WORLDS[currentWorldIndex];
  const char = CHARACTERS[world.characterId];
  const wp = worldProgress[currentWorldIndex];
  const success = correctInWorld >= world.questionsNeeded * 0.6;

  const isFinalWorld = currentWorldIndex === WORLDS.length - 1;
  const hasTransition = !isFinalWorld && success && char.transitionNarrative;

  const handleBack = () => {
    if (hasTransition) {
      setScreen("worldTransition");
    } else {
      setScreen("map");
    }
  };

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <TrophyRain />

      <motion.div
        className={styles.bigEmoji}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        style={{ fontSize: "5rem" }}
      >
        {success ? "🎊" : "💪"}
      </motion.div>

      <h2 className={styles.levelTitle}>{world.name} — הוּשְׁלַם!</h2>

      <p className={styles.scoreText}>
        עָנִיתָ נָכוֹן עַל {correctInWorld} מִתּוֹךְ {world.questionsNeeded} שְׁאֵלוֹת
      </p>

      <p className={styles.pointsText}>
        {scoreInWorld} נְקוּדוֹת
      </p>

      <div className={styles.starsEarned}>
        {"⭐".repeat(wp.stars)}
        {"☆".repeat(3 - wp.stars)}
      </div>

      <motion.div
        className={styles.charEndMsg}
        style={{ borderColor: char.color + "44" }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span style={{ fontSize: "1.5rem" }}>{char.emoji}</span>{" "}
        {success
          ? `${char.name}: "תּוֹדָה רַבָּה, ${playerName}! בְּזָכוּתְךָ הָעֶרְפֵל נֶחֱלָשׁ כָּאן! הַמַּמְלָכָה מוֹדָה לְךָ!"`
          : `${char.name}: "תּוֹדָה שֶׁנִּסִּיתָ, ${playerName}! אוּלַי נְנַסֶּה שׁוּב?"`}
      </motion.div>

      <motion.button
        className={styles.goldBtn}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        style={{ marginTop: "1.5rem" }}
      >
        {hasTransition ? "✨ הַמְשֵׁךְ" : "🗺️ חֲזָרָה לַמַּפָּה"}
      </motion.button>
    </motion.div>
  );
}

export function GameCompleteScreen() {
  const { playerName, totalStars, worldProgress, resetGame } = useGameStore();
  const totalPoints = worldProgress.reduce((s, w) => s + w.score, 0);

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <TrophyRain />

      <motion.div
        className={styles.bigEmoji}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150 }}
        style={{ fontSize: "6rem" }}
      >
        👑
      </motion.div>

      <h1 className={styles.victoryTitle}>גִּיבּוֹר הַמַּמְלָכָה!</h1>

      <motion.div
        className={styles.victoryStory}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {`הָעֶרְפֵל הִתְפּוֹגֵג! בְּזָכוּת ${playerName} הָאַמִּיץ,\nמַמְלֶכֶת הַחִידוֹת חוֹזֶרֶת לָזְהוֹר!\n\nזוֹהַר, נוּרִית, דָּנִיֵּאל, מִירִי וְהַמֶּלֶךְ חַכְמוֹן\nמוֹדִים לְךָ מִכָּל הַלֵּב! 🌟`}
      </motion.div>

      <div className={styles.finalStats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>⭐ {totalStars}</div>
          <div className={styles.statLabel}>כּוֹכָבִים</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalPoints}</div>
          <div className={styles.statLabel}>נְקוּדוֹת</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{WORLDS.length}</div>
          <div className={styles.statLabel}>עוֹלָמוֹת</div>
        </div>
      </div>

      <motion.button
        className={styles.goldBtn}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetGame}
      >
        🔄 הַרְפַּתְקָאָה חֲדָשָׁה!
      </motion.button>
    </motion.div>
  );
}

// ── Trophy Rain effect ──

function generateTrophyData() {
  return Array.from({ length: 25 }, () => ({
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    left: Math.random() * 100,
  }));
}

function TrophyRain() {
  const emojis = ["⭐", "🌟", "✨", "🎉", "🏆", "💫", "🎊"];
  const [data] = useState(generateTrophyData);

  return (
    <div className={styles.trophyRain}>
      {data.map((d, i) => (
        <motion.div
          key={i}
          className={styles.trophyItem}
          initial={{ y: -50, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 720 }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            ease: "easeIn",
          }}
          style={{ left: `${d.left}%`, position: "absolute", fontSize: "2rem" }}
        >
          {emojis[i % emojis.length]}
        </motion.div>
      ))}
    </div>
  );
}
