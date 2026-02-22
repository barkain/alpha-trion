import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS, CATEGORIES, DIFFICULTY_POINTS } from "../../config";
import type { Difficulty } from "../../types";
import { pickRandom, resolveGender } from "../../utils/helpers";
import { playSound, preloadSounds } from "../../services/soundManager";
import styles from "./screens.module.css";

/** Detect if a line looks like a math equation (contains operators among non-Hebrew chars). */
function isEquationLine(line: string): boolean {
  // Must contain = sign, inequality operators, or __ blank placeholder
  if (!/[=><]/.test(line) && !/__/.test(line)) return false;
  // Must contain at least one arithmetic operator
  if (!/[+\-×÷*]/.test(line)) return false;
  // Must NOT be predominantly Hebrew text (3+ consecutive Hebrew chars)
  if (/[\u0590-\u05FF]{3,}/.test(line)) return false;
  return true;
}

/** Render text with equation lines wrapped in LTR direction. */
function renderWithLtr(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isEq = isEquationLine(line);
    return (
      <span key={i}>
        {i > 0 && "\n"}
        {isEq ? <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{line}</span> : line}
      </span>
    );
  });
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "קַל",
  medium: "בֵּינוֹנִי",
  hard: "קָשֶׁה",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "#2ecc71",
  medium: "#f39c12",
  hard: "#e74c3c",
};

export function QuestionScreen() {
  const {
    currentWorldIndex,
    questions,
    currentQuestionIndex,
    selectedOption,
    answered,
    showHint,
    lives,
    scoreInWorld,
    streak,
    lastStreakMultiplier,
    lastSpeedBonus,
    playerGender,
    answerQuestion,
    nextQuestion,
    toggleHint,
    setScreen,
    updateFogStrength,
  } = useGameStore();

  const [charFeedback, setCharFeedback] = useState<{
    type: "correct" | "wrong";
    text: string;
  } | null>(null);

  const [showSpeedBonus, setShowSpeedBonus] = useState(false);

  const world = WORLDS[currentWorldIndex];
  const char = CHARACTERS[world.characterId];
  const q = questions[currentQuestionIndex];

  // Preload sounds on first interaction
  useEffect(() => {
    preloadSounds();
  }, []);

  // Update fog when answering correctly
  useEffect(() => {
    if (answered) updateFogStrength();
  }, [answered, updateFogStrength]);

  // Auto-hide speed bonus popup after delay
  useEffect(() => {
    if (!showSpeedBonus) return;
    const timer = setTimeout(() => setShowSpeedBonus(false), 1500);
    return () => clearTimeout(timer);
  }, [showSpeedBonus]);

  if (!q) return null;

  const handleAnswer = (idx: number) => {
    if (answered) return;
    preloadSounds();
    playSound("click");
    const isCorrect = idx === q.ans;
    setCharFeedback({
      type: isCorrect ? "correct" : "wrong",
      text: resolveGender(
        pickRandom(isCorrect ? char.correctResponses : char.wrongResponses),
        playerGender,
      ),
    });
    answerQuestion(idx);
    // Show speed bonus popup (will auto-hide via effect)
    if (isCorrect) {
      setShowSpeedBonus(true);
    }
  };

  const handleNext = () => {
    setCharFeedback(null);
    nextQuestion();
  };

  const category = CATEGORIES[q.cat];
  const isWrongAnswer = answered && charFeedback?.type === "wrong";

  return (
    <motion.div
      className={styles.questionOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className={styles.qHeader}>
        <button className={styles.backBtn} onClick={() => setScreen("map")}>
          → מַפָּה
        </button>
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            animate={{
              width: `${((currentQuestionIndex + (answered ? 1 : 0)) / questions.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className={styles.scoreDisplay}>
          {scoreInWorld} נק׳
          {/* Streak fire badge */}
          {streak >= 2 && (
            <motion.span
              className={styles.streakBadge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={streak}
            >
              🔥×{streak}
              {lastStreakMultiplier > 1 && (
                <span className={styles.multiplierText}>×{lastStreakMultiplier}</span>
              )}
            </motion.span>
          )}
        </div>
        <div className={styles.livesDisplay}>
          {"❤️".repeat(Math.max(0, lives))}
          {"🖤".repeat(Math.max(0, 3 - lives))}
        </div>
      </div>

      {/* Speed bonus popup */}
      <AnimatePresence>
        {showSpeedBonus && lastSpeedBonus > 0 && (
          <motion.div
            className={styles.speedBonusPopup}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            +{lastSpeedBonus} ⚡
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character strip */}
      <div className={styles.charStrip} style={{ borderColor: char.color + "44" }}>
        <motion.span
          className={styles.charStripEmoji}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {char.emoji}
        </motion.span>
        <span className={styles.charStripText}>
          {!answered
            ? `שְׁאֵלָה ${currentQuestionIndex + 1} מִתּוֹךְ ${questions.length} — ${char.name} מְחַכֶּה לַתְּשׁוּבָה!`
            : charFeedback?.text || ""}
        </span>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          className={styles.questionCard}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.badgeRow}>
            <span
              className={styles.catBadge}
              style={{
                background: category.color + "33",
                color: category.color,
              }}
            >
              {category.icon} {category.name}
            </span>
            {q.difficulty && (
              <span
                className={styles.diffBadge}
                style={{
                  background: DIFFICULTY_COLORS[q.difficulty] + "33",
                  color: DIFFICULTY_COLORS[q.difficulty],
                }}
              >
                {DIFFICULTY_LABELS[q.difficulty]} (+{DIFFICULTY_POINTS[q.difficulty]})
              </span>
            )}
          </div>

          {q.passage && (
            <div className={styles.passageBlock}>
              <span className={styles.passageIcon}>📖</span>
              <p className={styles.passageText}>{q.passage}</p>
            </div>
          )}

          <p className={styles.questionText}>{renderWithLtr(q.q)}</p>

          <div className={styles.optionsGrid}>
            {q.opts.map((opt, i) => {
              let variant = "default";
              if (answered) {
                if (i === q.ans) variant = "correct";
                else if (i === selectedOption && i !== q.ans) variant = "wrong";
                else variant = "disabled";
              }

              return (
                <motion.button
                  key={i}
                  className={`${styles.option} ${styles[`option_${variant}`]}`}
                  whileHover={!answered ? { x: -6 } : {}}
                  whileTap={!answered ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                >
                  {["א", "ב", "ג", "ד"][i]}. {isEquationLine(opt) ? <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{opt}</span> : opt}
                </motion.button>
              );
            })}
          </div>

          {/* Hint (before answer) */}
          {!answered && !showHint && (
            <button className={styles.hintBtn} onClick={toggleHint}>
              💡 רֶמֶז
            </button>
          )}
          {showHint && !answered && (
            <motion.div
              className={styles.hintText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              💡 {q.hint}
            </motion.div>
          )}

          {/* Post-answer explanation (wrong answer) */}
          {isWrongAnswer && q.hint && (
            <motion.div
              className={styles.explanationBox}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              הֶסְבֵּר: {q.hint}
            </motion.div>
          )}

          {/* Feedback & Next */}
          {answered && charFeedback && (
            <motion.div
              className={`${styles.charFeedback} ${
                charFeedback.type === "correct"
                  ? styles.feedbackCorrect
                  : styles.feedbackWrong
              }`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <span style={{ fontSize: "2rem" }}>{char.emoji}</span>
              <span>{charFeedback.text}</span>
            </motion.div>
          )}

          {answered && (
            <motion.button
              className={styles.goldBtn}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              style={{ marginTop: "1rem" }}
            >
              {currentQuestionIndex + 1 >= questions.length || lives <= 0
                ? "🏁 סִיּוּם"
                : "הַשְּׁאֵלָה הַבָּאָה ←"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
