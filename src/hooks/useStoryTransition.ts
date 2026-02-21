import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../stores/gameStore";

export function useStoryTransition() {
  const storyStep = useGameStore((s) => s.storyStep);
  const progressRef = useRef(storyStep);

  useFrame((_, delta) => {
    progressRef.current +=
      (storyStep - progressRef.current) * (1 - Math.exp(-2 * delta));
  });

  return progressRef.current;
}
