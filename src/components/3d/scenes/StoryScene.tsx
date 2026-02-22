import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useGameStore } from "../../../stores/gameStore";
import { StoryCamera } from "./StoryCamera";
import { StoryLighting } from "./StoryLighting";
import { StoryRoom } from "./StoryRoom";
import { StoryDarkness } from "./StoryDarkness";
import { StoryPortal } from "./StoryPortal";

export function StoryScene() {
  const storyStep = useGameStore((s) => s.storyStep);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas shadows style={{ background: "transparent" }} gl={{ alpha: true, antialias: true }}>
        <Suspense fallback={null}>
          <StoryCamera />
          <StoryLighting />
          <Stars radius={50} depth={30} count={200} factor={3} fade speed={0.5} />
          <StoryRoom active={storyStep === 0} />
          <StoryDarkness active={storyStep === 1} />
          <StoryPortal active={storyStep === 2} />
        </Suspense>
      </Canvas>
    </div>
  );
}
