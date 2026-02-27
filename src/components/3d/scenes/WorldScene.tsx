import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";
import { WORLDS } from "../../../config";
import { SceneObjectMesh } from "../objects/SceneObjectMesh";
import { Ground } from "../objects/Ground";
import { MagicFog } from "../effects/MagicFog";
import { FloatingParticles } from "../effects/FloatingParticles";
import { AnswerBurst } from "../effects/AnswerBurst";
import { EnvironmentParticles } from "../effects/EnvironmentParticles";
import { MagicCircle } from "../effects/MagicCircle";
import { WorldNPC } from "../objects/WorldNPC";

// Enhancement #3: Per-world lighting config
const WORLD_LIGHTING: {
  ambient: string;
  ambientIntensity: number;
  directional: string;
  directionalIntensity: number;
  hemisphere: [string, string, number];
  points: { position: [number, number, number]; color: string; intensity: number; distance: number }[];
}[] = [
  // World 0: Forest — warm greens
  {
    ambient: "#2d5016",
    ambientIntensity: 0.35,
    directional: "#ffe4b5",
    directionalIntensity: 0.7,
    hemisphere: ["#4a7c2e", "#0d2818", 0.3],
    points: [
      { position: [3, 3, 2], color: "#7cfc00", intensity: 0.4, distance: 10 },
      { position: [-4, 2, -3], color: "#FFD700", intensity: 0.3, distance: 8 },
    ],
  },
  // World 1: Cave — deep purples
  {
    ambient: "#4a1942",
    ambientIntensity: 0.25,
    directional: "#d8b4fe",
    directionalIntensity: 0.5,
    hemisphere: ["#7c3aed", "#1a0533", 0.25],
    points: [
      { position: [2, 4, 1], color: "#a855f7", intensity: 0.6, distance: 10 },
      { position: [-3, 2, -2], color: "#c084fc", intensity: 0.4, distance: 8 },
      { position: [0, 5, -4], color: "#9333ea", intensity: 0.3, distance: 12 },
    ],
  },
  // World 2: Library — golden warmth
  {
    ambient: "#2d6a4f",
    ambientIntensity: 0.35,
    directional: "#ffd700",
    directionalIntensity: 0.6,
    hemisphere: ["#4ade80", "#1b3a2a", 0.3],
    points: [
      { position: [0, 5, 0], color: "#FFD700", intensity: 0.5, distance: 12 },
      { position: [4, 3, -2], color: "#f59e0b", intensity: 0.4, distance: 8 },
    ],
  },
  // World 3: Tower — cool blues
  {
    ambient: "#1a1a5e",
    ambientIntensity: 0.3,
    directional: "#93c5fd",
    directionalIntensity: 0.6,
    hemisphere: ["#3b82f6", "#0d0d3b", 0.3],
    points: [
      { position: [0, 6, 0], color: "#60a5fa", intensity: 0.5, distance: 12 },
      { position: [-3, 3, 3], color: "#818cf8", intensity: 0.4, distance: 8 },
      { position: [3, 2, -3], color: "#38bdf8", intensity: 0.3, distance: 10 },
    ],
  },
  // World 4: Palace — royal gold
  {
    ambient: "#8b6914",
    ambientIntensity: 0.4,
    directional: "#ffd700",
    directionalIntensity: 0.8,
    hemisphere: ["#fbbf24", "#3d2806", 0.35],
    points: [
      { position: [0, 5, 0], color: "#FFD700", intensity: 0.6, distance: 14 },
      { position: [4, 3, 2], color: "#FFA500", intensity: 0.5, distance: 10 },
      { position: [-4, 3, -2], color: "#f59e0b", intensity: 0.4, distance: 8 },
    ],
  },
];

// Enhancement #6: Camera shake on wrong answer
function ShakeGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const shakeStartRef = useRef<number | null>(null);
  const answerFeedback = useGameStore((s) => s.answerFeedback);
  const prevFeedback = useRef<string | null>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Detect new wrong answer
    if (answerFeedback === "wrong" && prevFeedback.current !== "wrong") {
      shakeStartRef.current = t;
    }
    prevFeedback.current = answerFeedback;

    if (shakeStartRef.current !== null) {
      const elapsed = t - shakeStartRef.current;
      if (elapsed < 0.4) {
        const decay = 1 - elapsed / 0.4;
        const shake = Math.sin(elapsed * 40) * 0.08 * decay;
        groupRef.current.position.x = shake;
        groupRef.current.position.y = shake * 0.5;
      } else {
        groupRef.current.position.x = 0;
        groupRef.current.position.y = 0;
        shakeStartRef.current = null;
      }
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// Enhancement #15: Dynamic FOV camera
function DynamicCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const fogStrength = useGameStore((s) => s.fogStrength);
  const answerFeedback = useGameStore((s) => s.answerFeedback);
  const prevFeedback = useRef<string | null>(null);
  const punchStartRef = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    const t = clock.getElapsedTime();

    // Base FOV: lerp 55→62 as fog clears
    const baseFov = 55 + (1 - fogStrength) * 7;

    // Correct answer: brief zoom-in punch
    if (answerFeedback === "correct" && prevFeedback.current !== "correct") {
      punchStartRef.current = t;
    }
    prevFeedback.current = answerFeedback;

    let fov = baseFov;
    if (punchStartRef.current !== null) {
      const elapsed = t - punchStartRef.current;
      if (elapsed < 0.3) {
        // Quick zoom in then spring back
        const punch = Math.sin(elapsed * Math.PI / 0.15) * 5;
        fov = baseFov - Math.max(0, punch);
      } else {
        punchStartRef.current = null;
      }
    }

    cameraRef.current.fov = fov;
    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 3, 8]}
      fov={55}
    />
  );
}

// Enhancement #4: Fog-linked lighting
function FogLinkedLights({ worldIndex }: { worldIndex: number }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fogStrength = useGameStore((s) => s.fogStrength);
  const lighting = WORLD_LIGHTING[worldIndex] ?? WORLD_LIGHTING[0];

  useFrame(() => {
    const brightness = 1 - fogStrength * 0.4; // 0.6 at full fog → 1.0 at no fog
    if (ambientRef.current) {
      ambientRef.current.intensity = lighting.ambientIntensity * brightness;
    }
    if (directionalRef.current) {
      directionalRef.current.intensity = lighting.directionalIntensity * brightness;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={lighting.ambientIntensity} color={lighting.ambient} />
      <directionalLight
        ref={directionalRef}
        position={[5, 8, 3]}
        intensity={lighting.directionalIntensity}
        color={lighting.directional}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={lighting.hemisphere} />
      {lighting.points.map((p, i) => (
        <pointLight
          key={i}
          position={p.position}
          color={p.color}
          intensity={p.intensity}
          distance={p.distance}
        />
      ))}
    </>
  );
}

export function WorldScene() {
  const generatedScene = useGameStore((s) => s.generatedScene);
  const currentWorldIndex = useGameStore((s) => s.currentWorldIndex);
  const world = WORLDS[currentWorldIndex];

  const fogColor = generatedScene?.fogColor || world.scene.palette[2];
  const groundColor = generatedScene?.groundColor || world.scene.palette[0];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        shadows
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Enhancement #15: Dynamic FOV camera */}
          <DynamicCamera />

          {/* Fog must be a direct child of the scene (Canvas), not inside a group */}
          <fog attach="fog" args={[fogColor, 8, 25]} />

          {/* Stars should not shake on wrong answers */}
          <Stars radius={50} depth={30} count={300} factor={3} fade speed={0.5} />

          {/* Enhancement #3 + #4: Per-world fog-linked lighting (outside shake so lights stay stable) */}
          <FogLinkedLights worldIndex={currentWorldIndex} />

          {/* Enhancement #6: Shake group wraps scene objects only */}
          <ShakeGroup>
            {/* Ground (Enhancement #10 is in Ground.tsx) */}
            <Ground color={groundColor} worldIndex={currentWorldIndex} />

            {/* Enhancement #11: Magic circle ground effect */}
            <MagicCircle worldIndex={currentWorldIndex} />

            {/* AI-Generated objects */}
            {generatedScene?.objects.map((obj, i) => (
              <SceneObjectMesh key={i} obj={obj} index={i} />
            ))}

            {/* Fog particles */}
            <MagicFog color={fogColor} count={40} />

            {/* Fireflies */}
            <FloatingParticles count={30} color="#FFD700" spread={12} />

            {/* Enhancement #9: World-specific environmental particles */}
            <EnvironmentParticles worldIndex={currentWorldIndex} />

            {/* NPC character — central 3D companion */}
            <WorldNPC worldIndex={currentWorldIndex} />

            {/* Enhancement #5: Correct answer gold burst */}
            <AnswerBurst />
          </ShakeGroup>

          {/* Camera orbit — gentle auto-rotate, user can't interact */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            autoRotate
            autoRotateSpeed={0.3}
          />

          {/* Enhancement #1: Post-processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} intensity={0.6} mipmapBlur />
            <Vignette offset={0.3} darkness={0.6} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
