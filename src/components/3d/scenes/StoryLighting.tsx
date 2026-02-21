import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStoryTransition } from "../../../hooks/useStoryTransition";

const STEPS = {
  0: {
    ambientColor: "#FFA07A",
    ambientIntensity: 0.6,
    directionalColor: "#FFD700",
    directionalIntensity: 0.8,
    directionalPosition: [3, 5, 2] as const,
  },
  1: {
    ambientColor: "#1a0a2e",
    ambientIntensity: 0.2,
    directionalColor: "#4a1942",
    directionalIntensity: 0.3,
    directionalPosition: [-3, 4, -2] as const,
  },
  2: {
    ambientColor: "#FFD700",
    ambientIntensity: 0.5,
    directionalColor: "#FFFFFF",
    directionalIntensity: 1.0,
    directionalPosition: [0, 6, 3] as const,
  },
};

export function StoryLighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const directionalRef = useRef<THREE.DirectionalLight>(null!);
  const progress = useStoryTransition();

  const colors = useMemo(
    () => ({
      ambient0: new THREE.Color(STEPS[0].ambientColor),
      ambient1: new THREE.Color(STEPS[1].ambientColor),
      ambient2: new THREE.Color(STEPS[2].ambientColor),
      dir0: new THREE.Color(STEPS[0].directionalColor),
      dir1: new THREE.Color(STEPS[1].directionalColor),
      dir2: new THREE.Color(STEPS[2].directionalColor),
      lerpedAmbient: new THREE.Color(),
      lerpedDir: new THREE.Color(),
    }),
    []
  );

  useFrame(() => {
    const t = progress;

    if (!ambientRef.current || !directionalRef.current) return;

    if (t <= 1) {
      const alpha = t;

      colors.lerpedAmbient.lerpColors(colors.ambient0, colors.ambient1, alpha);
      colors.lerpedDir.lerpColors(colors.dir0, colors.dir1, alpha);

      const ambientIntensity =
        STEPS[0].ambientIntensity +
        (STEPS[1].ambientIntensity - STEPS[0].ambientIntensity) * alpha;
      const dirIntensity =
        STEPS[0].directionalIntensity +
        (STEPS[1].directionalIntensity - STEPS[0].directionalIntensity) *
          alpha;

      ambientRef.current.color.copy(colors.lerpedAmbient);
      ambientRef.current.intensity = ambientIntensity;

      directionalRef.current.color.copy(colors.lerpedDir);
      directionalRef.current.intensity = dirIntensity;

      directionalRef.current.position.set(
        STEPS[0].directionalPosition[0] +
          (STEPS[1].directionalPosition[0] - STEPS[0].directionalPosition[0]) *
            alpha,
        STEPS[0].directionalPosition[1] +
          (STEPS[1].directionalPosition[1] - STEPS[0].directionalPosition[1]) *
            alpha,
        STEPS[0].directionalPosition[2] +
          (STEPS[1].directionalPosition[2] - STEPS[0].directionalPosition[2]) *
            alpha
      );
    } else {
      const alpha = t - 1;

      colors.lerpedAmbient.lerpColors(colors.ambient1, colors.ambient2, alpha);
      colors.lerpedDir.lerpColors(colors.dir1, colors.dir2, alpha);

      const ambientIntensity =
        STEPS[1].ambientIntensity +
        (STEPS[2].ambientIntensity - STEPS[1].ambientIntensity) * alpha;
      const dirIntensity =
        STEPS[1].directionalIntensity +
        (STEPS[2].directionalIntensity - STEPS[1].directionalIntensity) *
          alpha;

      ambientRef.current.color.copy(colors.lerpedAmbient);
      ambientRef.current.intensity = ambientIntensity;

      directionalRef.current.color.copy(colors.lerpedDir);
      directionalRef.current.intensity = dirIntensity;

      directionalRef.current.position.set(
        STEPS[1].directionalPosition[0] +
          (STEPS[2].directionalPosition[0] - STEPS[1].directionalPosition[0]) *
            alpha,
        STEPS[1].directionalPosition[1] +
          (STEPS[2].directionalPosition[1] - STEPS[1].directionalPosition[1]) *
            alpha,
        STEPS[1].directionalPosition[2] +
          (STEPS[2].directionalPosition[2] - STEPS[1].directionalPosition[2]) *
            alpha
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <directionalLight
        ref={directionalRef}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
    </>
  );
}
