import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";

interface WorldNPCProps {
  worldIndex: number;
}

// Character color configs
const NPC_CONFIGS = [
  // World 0: Zohar the Fox
  { body: "#FF6B35", accent: "#E55A2B", eyes: "#FFFFFF", pupils: "#1a1a1a", glow: "#FF8C00", emissive: "#FF4500" },
  // World 1: Nurit the Owl
  { body: "#9B59B6", accent: "#7D3C98", eyes: "#FFD700", pupils: "#1a1a1a", glow: "#BA68C8", emissive: "#8E24AA" },
  // World 2: Daniel the Dragon
  { body: "#2ECC71", accent: "#27AE60", eyes: "#FFD700", pupils: "#1a1a1a", glow: "#66BB6A", emissive: "#1B5E20" },
  // World 3: Miri the Sorceress
  { body: "#3498DB", accent: "#2980B9", eyes: "#FFFFFF", pupils: "#1a1a1a", glow: "#42A5F5", emissive: "#1565C0" },
  // World 4: King Chakhmon
  { body: "#C0392B", accent: "#922B21", eyes: "#FFFFFF", pupils: "#1a1a1a", glow: "#FFD700", emissive: "#B71C1C" },
];

/** Fox: pointy ears, big bushy tail, snout */
function FoxBody({ colors }: { colors: typeof NPC_CONFIGS[0] }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.4, 8, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0.08]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 1.05, 0.28]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.08, 0.18, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.6} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.07, 0.36]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Left ear */}
      <mesh position={[-0.12, 1.4, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.06, 0.2, 4]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.12, 1.4, 0]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.06, 0.2, 4]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.08, 1.2, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>
      <mesh position={[0.08, 1.2, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.08, 1.2, 0.22]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      <mesh position={[0.08, 1.2, 0.22]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.35, -0.35]} rotation={[0.8, 0, 0]}>
        <capsuleGeometry args={[0.08, 0.35, 8, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.8} />
      </mesh>
      {/* Tail tip */}
      <mesh position={[0, 0.55, -0.55]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Owl: big round head, large eyes, small beak, wing flaps */
function OwlBody({ colors }: { colors: typeof NPC_CONFIGS[0] }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.3, 8, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, 0.4, 0.12]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#D4C4A8" roughness={0.8} />
      </mesh>
      {/* Head — large! */}
      <mesh position={[0, 1.0, 0.05]} castShadow>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.6} />
      </mesh>
      {/* Left eye disc */}
      <mesh position={[-0.1, 1.05, 0.24]}>
        <circleGeometry args={[0.09, 16]} />
        <meshStandardMaterial color={colors.accent} side={THREE.DoubleSide} />
      </mesh>
      {/* Right eye disc */}
      <mesh position={[0.1, 1.05, 0.24]}>
        <circleGeometry args={[0.09, 16]} />
        <meshStandardMaterial color={colors.accent} side={THREE.DoubleSide} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.1, 1.05, 0.25]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={colors.eyes} emissive={colors.eyes} emissiveIntensity={0.5} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.1, 1.05, 0.25]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={colors.eyes} emissive={colors.eyes} emissiveIntensity={0.5} />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.1, 1.05, 0.31]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      <mesh position={[0.1, 1.05, 0.31]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      {/* Beak */}
      <mesh position={[0, 0.93, 0.3]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.04, 0.1, 4]} />
        <meshStandardMaterial color="#F4A460" />
      </mesh>
      {/* Ear tufts */}
      <mesh position={[-0.18, 1.3, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.04, 0.15, 4]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      <mesh position={[0.18, 1.3, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.04, 0.15, 4]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.3, 0.5, -0.05]} rotation={[0, 0.3, 0.2]}>
        <boxGeometry args={[0.2, 0.35, 0.03]} />
        <meshStandardMaterial color={colors.accent} roughness={0.7} />
      </mesh>
      {/* Right wing */}
      <mesh position={[0.3, 0.5, -0.05]} rotation={[0, -0.3, -0.2]}>
        <boxGeometry args={[0.2, 0.35, 0.03]} />
        <meshStandardMaterial color={colors.accent} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Dragon: elongated body, wings, tail, small horns */
function DragonBody({ colors }: { colors: typeof NPC_CONFIGS[0] }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.5, 8, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Belly plates */}
      <mesh position={[0, 0.45, 0.14]}>
        <capsuleGeometry args={[0.12, 0.3, 8, 8]} />
        <meshStandardMaterial color="#90EE90" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0.1]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.5} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 1.1, 0.3]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.15]} />
        <meshStandardMaterial color={colors.accent} roughness={0.5} />
      </mesh>
      {/* Nostrils - small glowing */}
      <mesh position={[-0.03, 1.12, 0.37]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.03, 1.12, 0.37]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={2} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 1.22, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} emissive={colors.eyes} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.1, 1.22, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} emissive={colors.eyes} emissiveIntensity={0.3} />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.1, 1.22, 0.24]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      <mesh position={[0.1, 1.22, 0.24]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      {/* Horns */}
      <mesh position={[-0.1, 1.35, -0.05]} rotation={[0.4, 0, -0.2]}>
        <coneGeometry args={[0.03, 0.15, 6]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 1.35, -0.05]} rotation={[0.4, 0, 0.2]}>
        <coneGeometry args={[0.03, 0.15, 6]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.35, 0.8, -0.1]} rotation={[0, 0.4, 0.5]}>
        <boxGeometry args={[0.35, 0.4, 0.02]} />
        <meshStandardMaterial color={colors.accent} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wing */}
      <mesh position={[0.35, 0.8, -0.1]} rotation={[0, -0.4, -0.5]}>
        <boxGeometry args={[0.35, 0.4, 0.02]} />
        <meshStandardMaterial color={colors.accent} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.3, -0.4]} rotation={[1, 0, 0]}>
        <coneGeometry args={[0.08, 0.5, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.5} />
      </mesh>
      {/* Tail tip */}
      <mesh position={[0, 0.15, -0.7]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.05, 0.12, 4]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
    </group>
  );
}

/** Sorceress: robe, pointy hat, staff with glowing orb */
function SorceressBody({ colors }: { colors: typeof NPC_CONFIGS[0] }) {
  return (
    <group>
      {/* Robe / body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.35, 1.0, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0.05]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#FFDAB9" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.06, 1.18, 0.17]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>
      <mesh position={[0.06, 1.18, 0.17]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.06, 1.18, 0.2]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#3498DB" />
      </mesh>
      <mesh position={[0.06, 1.18, 0.2]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#3498DB" />
      </mesh>
      {/* Smile */}
      <mesh position={[0, 1.1, 0.18]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.04, 0.008, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 1.5, 0]} rotation={[0.1, 0, 0]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.5} />
      </mesh>
      {/* Hat brim */}
      <mesh position={[0, 1.28, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.28, 16]} />
        <meshStandardMaterial color={colors.accent} side={THREE.DoubleSide} />
      </mesh>
      {/* Hat star */}
      <mesh position={[0, 1.45, 0.18]}>
        <octahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
      </mesh>
      {/* Staff */}
      <mesh position={[0.35, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 1.3, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Staff orb */}
      <mesh position={[0.35, 1.3, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color={colors.glow}
          emissive={colors.glow}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {/* Staff light */}
      <pointLight position={[0.35, 1.3, 0]} color={colors.glow} intensity={0.5} distance={4} />
    </group>
  );
}

/** King: crown, royal robe, scepter */
function KingBody({ colors }: { colors: typeof NPC_CONFIGS[0] }) {
  return (
    <group>
      {/* Robe body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.35, 1.0, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.5} />
      </mesh>
      {/* Robe trim */}
      <mesh position={[0, 0.08, 0]}>
        <torusGeometry args={[0.34, 0.04, 8, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.55, 0.15]}>
        <boxGeometry args={[0.3, 0.06, 0.06]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0.05]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#FFDAB9" roughness={0.6} />
      </mesh>
      {/* Beard */}
      <mesh position={[0, 0.95, 0.15]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.12, 0.2, 8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.07, 1.2, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>
      <mesh position={[0.07, 1.2, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.07, 1.2, 0.23]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      <mesh position={[0.07, 1.2, 0.23]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color={colors.pupils} />
      </mesh>
      {/* Crown base */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.1, 12]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>
      {/* Crown points */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 0.16, 1.48, Math.cos(angle) * 0.16]}>
            <coneGeometry args={[0.03, 0.1, 4]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} emissive="#FFA500" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
      {/* Crown gems */}
      {[0, 2, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={`gem${i}`} position={[Math.sin(angle) * 0.19, 1.4, Math.cos(angle) * 0.19]}>
            <octahedronGeometry args={[0.025, 0]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1} />
          </mesh>
        );
      })}
      {/* Scepter */}
      <mesh position={[-0.4, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 1.2, 6]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Scepter orb */}
      <mesh position={[-0.4, 1.25, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[-0.4, 1.25, 0]} color="#FFD700" intensity={0.5} distance={4} />
    </group>
  );
}

// Character body components by world index
const CHARACTER_BODIES = [FoxBody, OwlBody, DragonBody, SorceressBody, KingBody];

/** Simple deterministic hash for sparkle initialization (avoids Math.random in render) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const SPARKLE_DATA = Array.from({ length: 12 }, (_, i) => ({
  angle: seededRandom(i * 4) * Math.PI * 2,
  speed: 2 + seededRandom(i * 4 + 1) * 3,
  height: 1 + seededRandom(i * 4 + 2) * 2,
  phase: seededRandom(i * 4 + 3) * Math.PI * 2,
}));

/** Celebration sparkles that burst around the NPC on correct answer */
function NPCSparkles({ active, color }: { active: boolean; color: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const startRef = useRef<number | null>(null);
  const prevActive = useRef(false);

  const sparkles = SPARKLE_DATA;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    if (active && !prevActive.current) {
      startRef.current = t;
    }
    prevActive.current = active;

    const elapsed = startRef.current !== null ? t - startRef.current : 999;
    const isActive = elapsed < 1.2;

    sparkles.forEach((s, i) => {
      if (isActive) {
        const life = elapsed;
        const fade = Math.max(0, 1 - life / 1.2);
        const r = life * s.speed * 0.3;
        dummy.position.set(
          Math.cos(s.angle + life * 2) * r,
          s.height * life * 0.8 + 0.5,
          Math.sin(s.angle + life * 2) * r,
        );
        dummy.scale.setScalar(0.04 * fade);
        dummy.rotation.set(t * 5, t * 3, 0);
      } else {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 12]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

export function WorldNPC({ worldIndex }: WorldNPCProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const answerFeedback = useGameStore((s) => s.answerFeedback);
  const answered = useGameStore((s) => s.answered);
  const prevFeedbackRef = useRef<string | null>(null);
  const reactionStartRef = useRef<number | null>(null);
  const reactionTypeRef = useRef<"correct" | "wrong" | null>(null);
  const enteredRef = useRef(false);
  const spawnTimeRef = useRef(-1);

  const config = NPC_CONFIGS[worldIndex] ?? NPC_CONFIGS[0];
  const CharBody = CHARACTER_BODIES[worldIndex] ?? CHARACTER_BODIES[0];

  useFrame(({ clock }) => {
    if (!groupRef.current || !bodyGroupRef.current) return;
    const t = clock.getElapsedTime();

    // Entrance: scale up from 0
    if (!enteredRef.current) {
      if (spawnTimeRef.current < 0) spawnTimeRef.current = t;
      const elapsed = t - spawnTimeRef.current;
      if (elapsed < 1.0) {
        const p = elapsed / 1.0;
        const eased = 1 - Math.pow(1 - p, 3);
        const bounce = 1 + Math.sin(p * Math.PI) * 0.15;
        groupRef.current.scale.setScalar(eased * bounce);
        return;
      }
      enteredRef.current = true;
      groupRef.current.scale.setScalar(1);
    }

    // Detect new feedback
    if (answerFeedback && answerFeedback !== prevFeedbackRef.current) {
      reactionStartRef.current = t;
      reactionTypeRef.current = answerFeedback;
    }
    prevFeedbackRef.current = answerFeedback;

    // Base idle animation — gentle breathing + bob
    const breathe = Math.sin(t * 2) * 0.03;
    const bob = Math.sin(t * 1.5) * 0.05;
    const posY = bob;
    let rotY = Math.sin(t * 0.5) * 0.1; // Gentle look-around
    let scaleX = 1 + breathe;
    let scaleY = 1 - breathe * 0.5;
    let rotZ = 0;
    let extraY = 0;

    // Reaction animations
    if (reactionStartRef.current !== null) {
      const elapsed = t - reactionStartRef.current;

      if (reactionTypeRef.current === "correct") {
        if (elapsed < 1.5) {
          const phase = elapsed / 1.5;
          // Jump up and celebrate
          extraY = Math.sin(phase * Math.PI * 3) * 0.5 * (1 - phase);
          // Spin on Y
          rotY = elapsed * 8 * (1 - phase);
          // Happy squash & stretch
          scaleX = 1 + Math.sin(elapsed * 15) * 0.08 * (1 - phase);
          scaleY = 1 - Math.sin(elapsed * 15) * 0.05 * (1 - phase);
        } else {
          reactionStartRef.current = null;
          reactionTypeRef.current = null;
        }
      } else if (reactionTypeRef.current === "wrong") {
        if (elapsed < 0.8) {
          const phase = elapsed / 0.8;
          // Sad shake
          rotZ = Math.sin(elapsed * 20) * 0.1 * (1 - phase);
          // Shrink slightly
          scaleX = 1 - 0.05 * (1 - phase);
          scaleY = 1 - 0.08 * (1 - phase);
          // Slump down
          extraY = -0.1 * (1 - phase);
        } else {
          reactionStartRef.current = null;
          reactionTypeRef.current = null;
        }
      }
    }

    bodyGroupRef.current.position.y = posY + extraY;
    bodyGroupRef.current.rotation.y = rotY;
    bodyGroupRef.current.rotation.z = rotZ;
    bodyGroupRef.current.scale.set(scaleX, scaleY, scaleX);
  });

  return (
    <group position={[-3.5, 0, -1]} scale={0.7}>
      <group ref={groupRef} scale={0}>
        <group ref={bodyGroupRef}>
          <CharBody colors={config} />
        </group>

        {/* Character glow */}
        <pointLight
          position={[0, 0.8, 0.3]}
          color={config.glow}
          intensity={answered ? 0.5 : 0.3}
          distance={5}
        />

        {/* Celebration sparkles */}
        <NPCSparkles
          active={answerFeedback === "correct"}
          color={config.glow}
        />

        {/* Floating emoji above head */}
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.001, 1, 1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
}
