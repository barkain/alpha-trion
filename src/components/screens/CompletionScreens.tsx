import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS, CATEGORIES } from "../../config";
import { addEntry } from "../../services/leaderboard";
import type { CategoryId, Difficulty } from "../../types";
import { resolveGender } from "../../utils/helpers";
import styles from "./screens.module.css";

export function LevelCompleteScreen() {
  const {
    currentWorldIndex, correctInWorld, scoreInWorld, worldProgress,
    playerName, playerGender, setScreen, questionResults, maxStreak,
  } = useGameStore();

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

  const { categoryStats, avgTimeSeconds, diffStats, perfectCount } = useMemo(() => {
    const cats = new Map<CategoryId, { correct: number; total: number }>();
    const diffs: Record<Difficulty, { correct: number; total: number }> = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };
    let totalTime = 0;

    for (const r of questionResults) {
      const cat = cats.get(r.category) ?? { correct: 0, total: 0 };
      cat.total++;
      if (r.correct) cat.correct++;
      cats.set(r.category, cat);

      diffs[r.difficulty].total++;
      if (r.correct) diffs[r.difficulty].correct++;

      totalTime += r.timeMs;
    }

    const avg = questionResults.length > 0 ? totalTime / questionResults.length / 1000 : 0;
    const perfect = Array.from(cats.values()).filter(c => c.total > 0 && c.correct === c.total).length;

    return { categoryStats: cats, avgTimeSeconds: avg, diffStats: diffs, perfectCount: perfect };
  }, [questionResults]);

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
        {resolveGender("{עָנִיתָ|עָנִית}", playerGender)} נָכוֹן עַל {correctInWorld} מִתּוֹךְ {world.questionsNeeded} שְׁאֵלוֹת
      </p>

      <p className={styles.pointsText}>
        {scoreInWorld} נְקוּדוֹת
      </p>

      <div className={styles.starsEarned}>
        {"⭐".repeat(wp.stars)}
        {"☆".repeat(3 - wp.stars)}
      </div>

      {questionResults.length > 0 && (
        <>
          <motion.div
            className={styles.levelStatsSection}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {world.categories.map((catId) => {
              const stat = categoryStats.get(catId);
              if (!stat || stat.total === 0) return null;
              const cat = CATEGORIES[catId];
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={catId} className={styles.categoryBar}>
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <div className={styles.categoryInfo}>
                    <div className={styles.categoryName}>{cat.name}</div>
                    <div className={styles.categoryTrack}>
                      <motion.div
                        className={styles.categoryFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ background: cat.color }}
                      />
                    </div>
                  </div>
                  <span className={styles.categoryCount}>{stat.correct}/{stat.total}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            className={styles.statsGrid}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>🔥</div>
              <div className={styles.levelStatValue}>{maxStreak}</div>
              <div className={styles.levelStatLabel}>רצף מירבי</div>
            </div>
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>⚡</div>
              <div className={styles.levelStatValue}>{avgTimeSeconds.toFixed(1)}s</div>
              <div className={styles.levelStatLabel}>זמן ממוצע</div>
            </div>
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>💯</div>
              <div className={styles.levelStatValue}>{perfectCount}</div>
              <div className={styles.levelStatLabel}>קטגוריות מושלמות</div>
            </div>
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>💎</div>
              <div className={styles.levelStatValue}>
                {diffStats.hard.correct}/{diffStats.hard.total}
              </div>
              <div className={styles.levelStatLabel}>שאלות קשות</div>
            </div>
          </motion.div>
        </>
      )}

      <motion.div
        className={styles.charEndMsg}
        style={{ borderColor: char.color + "44" }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span style={{ fontSize: "1.5rem" }}>{char.emoji}</span>{" "}
        {success
          ? resolveGender(`${char.name}: "תּוֹדָה רַבָּה, ${playerName}! {בְּזָכוּתְךָ|בְּזָכוּתֵךְ} הָעֶרְפֵל נֶחֱלָשׁ כָּאן! הַמַּמְלָכָה מוֹדָה {לְךָ|לָךְ}!"`, playerGender)
          : resolveGender(`${char.name}: "תּוֹדָה {שֶׁנִּסִּיתָ|שֶׁנִּסִּית}, ${playerName}! אוּלַי נְנַסֶּה שׁוּב?"`, playerGender)}
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
  const {
    playerName, playerGender, totalStars, worldProgress, resetGame,
    questionResults, maxStreak, currentWorldIndex,
  } = useGameStore();
  const totalPoints = worldProgress.reduce((s, w) => s + w.score, 0);
  const world = WORLDS[currentWorldIndex];
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      playerName,
      totalStars,
      totalScore: totalPoints,
      worldsCompleted: worldProgress.filter((w) => w.completed).length,
      maxStreak,
      date: new Date().toISOString(),
    });
  }, []);

  const { categoryStats, avgTimeSeconds, diffStats, perfectCount } = useMemo(() => {
    const cats = new Map<CategoryId, { correct: number; total: number }>();
    const diffs: Record<Difficulty, { correct: number; total: number }> = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };
    let totalTime = 0;

    for (const r of questionResults) {
      const cat = cats.get(r.category) ?? { correct: 0, total: 0 };
      cat.total++;
      if (r.correct) cat.correct++;
      cats.set(r.category, cat);

      diffs[r.difficulty].total++;
      if (r.correct) diffs[r.difficulty].correct++;

      totalTime += r.timeMs;
    }

    const avg = questionResults.length > 0 ? totalTime / questionResults.length / 1000 : 0;
    const perfect = Array.from(cats.values()).filter(c => c.total > 0 && c.correct === c.total).length;

    return { categoryStats: cats, avgTimeSeconds: avg, diffStats: diffs, perfectCount: perfect };
  }, [questionResults]);

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

      <h1 className={styles.victoryTitle}>{resolveGender("{גִּיבּוֹר|גִּיבּוֹרַת}", playerGender)} הַמַּמְלָכָה!</h1>

      <motion.div
        className={styles.victoryStory}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {resolveGender(`הָעֶרְפֵל הִתְפּוֹגֵג! בְּזָכוּת ${playerName} {הָאַמִּיץ|הָאַמִּיצָה},\nמַמְלֶכֶת הַחִידוֹת חוֹזֶרֶת לָזְהוֹר!\n\nזוֹהַר, נוּרִית, דָּנִיֵּאל, מִירִי וְהַמֶּלֶךְ חַכְמוֹן\nמוֹדִים {לְךָ|לָךְ} מִכָּל הַלֵּב! 🌟`, playerGender)}
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

      {questionResults.length > 0 && (
        <>
          <motion.div
            className={styles.levelStatsSection}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {world.categories.map((catId) => {
              const stat = categoryStats.get(catId);
              if (!stat || stat.total === 0) return null;
              const cat = CATEGORIES[catId];
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={catId} className={styles.categoryBar}>
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <div className={styles.categoryInfo}>
                    <div className={styles.categoryName}>{cat.name}</div>
                    <div className={styles.categoryTrack}>
                      <motion.div
                        className={styles.categoryFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ background: cat.color }}
                      />
                    </div>
                  </div>
                  <span className={styles.categoryCount}>{stat.correct}/{stat.total}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            className={styles.statsGrid}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>🔥</div>
              <div className={styles.levelStatValue}>{maxStreak}</div>
              <div className={styles.levelStatLabel}>רצף מירבי</div>
            </div>
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>⚡</div>
              <div className={styles.levelStatValue}>{avgTimeSeconds.toFixed(1)}s</div>
              <div className={styles.levelStatLabel}>זמן ממוצע</div>
            </div>
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>💯</div>
              <div className={styles.levelStatValue}>{perfectCount}</div>
              <div className={styles.levelStatLabel}>קטגוריות מושלמות</div>
            </div>
            <div className={styles.levelStatCard}>
              <div className={styles.levelStatIcon}>💎</div>
              <div className={styles.levelStatValue}>
                {diffStats.hard.correct}/{diffStats.hard.total}
              </div>
              <div className={styles.levelStatLabel}>שאלות קשות</div>
            </div>
          </motion.div>
        </>
      )}

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
