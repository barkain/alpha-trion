import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { WORLDS, CHARACTERS, CATEGORIES, DIFFICULTY_POINTS } from "../../config";
import type { Difficulty } from "../../types";
import { pickRandom } from "../../utils/helpers";
import styles from "./screens.module.css";

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

  const world = WORLDS[currentWorldIndex];
  const char = CHARACTERS[world.characterId];
  const q = questions[currentQuestionIndex];

  // Update fog when answering correctly
  useEffect(() => {
    if (answered) updateFogStrength();
  }, [answered, updateFogStrength]);

  if (!q) return null;

  const handleAnswer = (idx: number) => {
    if (answered) return;
    const isCorrect = idx === q.ans;
    setCharFeedback({
      type: isCorrect ? "correct" : "wrong",
      text: pickRandom(isCorrect ? char.correctResponses : char.wrongResponses),
    });
    answerQuestion(idx);
  };

  const handleNext = () => {
    setCharFeedback(null);
    nextQuestion();
  };

  const category = CATEGORIES[q.cat];

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
        <div className={styles.scoreDisplay}>{scoreInWorld} נק׳</div>
        <div className={styles.livesDisplay}>
          {"❤️".repeat(Math.max(0, lives))}
          {"🖤".repeat(Math.max(0, 3 - lives))}
        </div>
      </div>

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

          <p className={styles.questionText}>{q.q}</p>

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
                  {["א", "ב", "ג", "ד"][i]}. {opt}
                </motion.button>
              );
            })}
          </div>

          {/* Hint */}
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
