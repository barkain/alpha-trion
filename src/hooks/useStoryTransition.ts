import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../stores/gameStore";

export function useStoryTransition() {
  const storyStep = useGameStore((s) => s.storyStep);
  const progressRef = useRef(storyStep);
  const [progress, setProgress] = useState(storyStep);

  useFrame((_, delta) => {
    progressRef.current +=
      (storyStep - progressRef.current) * (1 - Math.exp(-2 * delta));
    setProgress(progressRef.current);
  });

  return progress;
}
