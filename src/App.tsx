import { AnimatePresence } from "framer-motion";
import { useGameStore } from "./stores/gameStore";
import { WorldScene } from "./components/3d/scenes/WorldScene";
import {
  NameInputScreen,
  StoryScreen,
  MapScreen,
  CharIntroScreen,
  LoadingScreen,
  QuestionScreen,
  LevelCompleteScreen,
  GameCompleteScreen,
} from "./components/screens";

const BG_MAP: Record<string, string> = {
  nameInput: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  story: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  map: "linear-gradient(135deg, #0f0c29, #1a1a5e, #24243e)",
  gameComplete: "linear-gradient(135deg, #1a0f00, #3d2806, #5c3d1e)",
};

function App() {
  const screen = useGameStore((s) => s.screen);

  const show3D = screen === "question" || screen === "loading" || screen === "charIntro";

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
      {/* 3D Background — renders only during gameplay */}
      {show3D && <WorldScene />}

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
      </AnimatePresence>
    </div>
  );
}

export default App;
