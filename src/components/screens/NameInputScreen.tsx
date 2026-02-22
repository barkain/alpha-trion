import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { guessGender } from "../../utils/helpers";
import styles from "./screens.module.css";

export function NameInputScreen() {
  const { playerName, playerGender, setPlayerName, setPlayerGender, setScreen } =
    useGameStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNameChange = (name: string) => {
    setPlayerName(name);
    if (name.trim().length >= 2) {
      setPlayerGender(guessGender(name));
    }
  };

  const handleSubmit = () => {
    if (playerName.trim().length >= 2) {
      useGameStore.getState().setStoryStep(0);
      setScreen("story");
    }
  };

  const isFemale = playerGender === "female";

  return (
    <motion.div
      className={styles.centeredScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className={styles.bigEmoji}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        📖✨
      </motion.div>

      <h1 className={styles.gameTitle}>מַמְלֶכֶת הַחִידוֹת</h1>
      <p className={styles.subtitle}>הַרְפַּתְקָאָה שֶׁל חֲשִׁיבָה וָקֶסֶם</p>

      <motion.div
        className={styles.glassCard}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <p className={styles.prompt}>
          {isFemale ? "מָה שְׁמֵךְ, גִּיבּוֹרָה?" : "מָה שִׁמְךָ, גִּיבּוֹר?"} 🌟
        </p>
        <input
          ref={inputRef}
          className={styles.nameInput}
          type="text"
          placeholder={isFemale ? "הַכְנִיסִי אֶת שְׁמֵךְ..." : "הַכְנֵס אֶת שִׁמְךָ..."}
          value={playerName}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          maxLength={20}
        />
        {playerName.trim().length >= 2 && (
          <>
            <div className={styles.genderPicker}>
              <button
                className={`${styles.genderBtn} ${!isFemale ? styles.genderBtnActive : ""}`}
                onClick={() => setPlayerGender("male")}
              >
                👦 בֵּן
              </button>
              <button
                className={`${styles.genderBtn} ${isFemale ? styles.genderBtnActive : ""}`}
                onClick={() => setPlayerGender("female")}
              >
                👧 בַּת
              </button>
            </div>
            <motion.button
              className={styles.goldBtn}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
            >
              🚀 יַאלְלָה, מַתְחִילִים!
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
