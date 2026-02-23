import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useGameStore } from "./stores/gameStore";
import { WorldScene } from "./components/3d/scenes/WorldScene";
import { StoryScene } from "./components/3d/scenes/StoryScene";
import { MapScene } from "./components/3d/scenes/MapScene";
import { ConfettiScene } from "./components/3d/effects/ConfettiScene";
import { BadgeToast } from "./components/screens/BadgeToast";
import {
  NameInputScreen,
  StoryScreen,
  MapScreen,
  CharIntroScreen,
  LoadingScreen,
  QuestionScreen,
  LevelCompleteScreen,
  GameCompleteScreen,
  WorldTransitionScreen,
} from "./components/screens";

const BG_MAP: Record<string, string> = {
  nameInput: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  story: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  map: "linear-gradient(135deg, #050311, #0a0820, #050311)",
  gameComplete: "linear-gradient(135deg, #1a0f00, #3d2806, #5c3d1e)",
  worldTransition: "linear-gradient(135deg, #0f0c29, #1a1a5e, #24243e)",
};

function ResetButton() {
  const resetGame = useGameStore((s) => s.resetGame);
  const [confirming, setConfirming] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (confirming) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "1.5rem",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(15, 12, 41, 0.92)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(231, 76, 60, 0.5)",
          borderRadius: "16px",
          padding: "0.6rem 1rem",
          fontFamily: "'Rubik', sans-serif",
          direction: "rtl",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>
          להתחיל מחדש?
        </span>
        <button
          onClick={resetGame}
          style={{
            background: "rgba(231, 76, 60, 0.3)",
            border: "1px solid rgba(231, 76, 60, 0.6)",
            color: "#ff6b6b",
            padding: "0.35rem 0.8rem",
            borderRadius: "10px",
            cursor: "pointer",
            fontFamily: "'Rubik', sans-serif",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          כן
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            padding: "0.35rem 0.8rem",
            borderRadius: "10px",
            cursor: "pointer",
            fontFamily: "'Rubik', sans-serif",
            fontSize: "0.8rem",
          }}
        >
          לא
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="התחל מחדש"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 200,
        background: hovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
        border: `1px solid ${hovered ? "rgba(255, 215, 0, 0.4)" : "rgba(255, 255, 255, 0.2)"}`,
        borderRadius: "50%",
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        cursor: "pointer",
        color: "white",
        backdropFilter: "blur(8px)",
        transition: "all 0.2s",
      }}
    >
      ↺
    </button>
  );
}

function App() {
  const screen = useGameStore((s) => s.screen);

  const show3D = screen === "question" || screen === "loading" || screen === "charIntro";
  const showMap3D = screen === "map";
  const showConfetti = screen === "levelComplete" || screen === "gameComplete";

  const bg = BG_MAP[screen] ?? "linear-gradient(135deg, #0f0c29, #1a1a5e, #24243e)";

  return (
    <div
      style={{
        fontFamily: "'Rubik', sans-serif",
        direction: "rtl",
        minHeight: "100vh",
        color: "white",
        background: bg,
        transition: "background 0.8s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D Background — renders during gameplay */}
      {show3D && <WorldScene />}

      {/* 3D Background — renders during story */}
      {screen === "story" && <StoryScene />}

      {/* 3D Map — renders during map screen */}
      {showMap3D && <MapScene />}

      {/* 3D Confetti — renders during level/game complete */}
      {showConfetti && <ConfettiScene />}

      {/* Badge Toast — global overlay */}
      <BadgeToast />

      {/* Reset button — hidden on the starting screen */}
      {screen !== "nameInput" && <ResetButton />}

      {/* UI Layer */}
      <AnimatePresence mode="wait">
        {screen === "nameInput" && <NameInputScreen key="name" />}
        {screen === "story" && <StoryScreen key="story" />}
        {screen === "map" && <MapScreen key="map" />}
        {screen === "charIntro" && <CharIntroScreen key="charIntro" />}
        {screen === "loading" && <LoadingScreen key="loading" />}
        {screen === "question" && <QuestionScreen key="question" />}
        {screen === "levelComplete" && <LevelCompleteScreen key="levelComplete" />}
        {screen === "gameComplete" && <GameCompleteScreen key="gameComplete" />}
        {screen === "worldTransition" && <WorldTransitionScreen key="worldTransition" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
