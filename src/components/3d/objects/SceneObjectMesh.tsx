import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneObject } from "../../../types/game";
import { useGameStore } from "../../../stores/gameStore";

interface SceneObjectMeshProps {
  obj: SceneObject;
  index?: number;
}

/** Enhancement #2: Per-type material presets */
const MATERIAL_PRESETS: Record<string, { roughness: number; metalness: number; emissiveIntensity: number; transparent?: boolean; opacity?: number }> = {
  tree: { roughness: 0.8, metalness: 0, emissiveIntensity: 0.1 },
  rock: { roughness: 0.95, metalness: 0.05, emissiveIntensity: 0 },
  crystal: { roughness: 0.1, metalness: 0.8, emissiveIntensity: 1.0 },
  book: { roughness: 0.9, metalness: 0, emissiveIntensity: 0.2 },
  tower: { roughness: 0.5, metalness: 0.3, emissiveIntensity: 0.1 },
  orb: { roughness: 0.05, metalness: 0.2, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 },
  mushroom: { roughness: 0.7, metalness: 0, emissiveIntensity: 0.4 },
  pillar: { roughness: 0.6, metalness: 0.4, emissiveIntensity: 0.1 },
  arch: { roughness: 0.15, metalness: 0.7, emissiveIntensity: 0.8 },
};

// Magical object types that get emissive pulsing (#4)
const MAGICAL_TYPES = new Set(["crystal", "orb", "arch"]);

/** Maps SceneObject type → Three.js geometry */
function getGeometry(type: SceneObject["type"]): THREE.BufferGeometry {
  switch (type) {
    case "tree":
      return new THREE.ConeGeometry(0.6, 1.8, 6);
    case "rock":
      return new THREE.DodecahedronGeometry(0.5, 0);
    case "crystal":
      return new THREE.OctahedronGeometry(0.5, 0);
    case "book":
      return new THREE.BoxGeometry(0.8, 0.1, 0.6);
    case "tower":
      return new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
    case "orb":
      return new THREE.SphereGeometry(0.3, 16, 16);
    case "mushroom":
      return new THREE.SphereGeometry(0.4, 8, 8);
    case "pillar":
      return new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
    case "arch":
      return new THREE.TorusGeometry(1, 0.15, 8, 16, Math.PI);
    default:
      return new THREE.SphereGeometry(0.3, 8, 8);
  }
}

export function SceneObjectMesh({ obj, index = 0 }: SceneObjectMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  // Mesh is inside a <group position={obj.position}>, so local Y starts at 0
  const startY = 0;
  const [startTimeValue] = useState(() => Math.random() * Math.PI * 2);

  // Enhancement #7: Entrance animation state
  const [spawnTime] = useState(() => -1); // Will be set on first frame
  const spawnTimeRef = useRef(spawnTime);
  const hasEnteredRef = useRef(false);

  // Enhancement #8: Answer reaction state
  const answerFeedback = useGameStore((s) => s.answerFeedback);
  const prevFeedbackRef = useRef<string | null>(null);
  const reactionStartRef = useRef<number | null>(null);
  const reactionTypeRef = useRef<"correct" | "wrong" | null>(null);

  const preset = MATERIAL_PRESETS[obj.type] ?? { roughness: 0.6, metalness: 0.1, emissiveIntensity: 0 };

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const phase = t + startTimeValue;

    // Enhancement #7: Entrance animation
    if (!hasEnteredRef.current) {
      if (spawnTimeRef.current < 0) {
        spawnTimeRef.current = t + index * 0.12; // Stagger per object
      }
      const entranceElapsed = t - spawnTimeRef.current;
      if (entranceElapsed < 0) {
        meshRef.current.scale.setScalar(0);
        return;
      }
      if (entranceElapsed < 0.8) {
        // Cubic ease-out with slight overshoot
        const p = entranceElapsed / 0.8;
        const eased = 1 - Math.pow(1 - p, 3);
        const overshoot = 1 + Math.sin(p * Math.PI) * 0.12;
        const s = eased * overshoot * obj.scale;
        meshRef.current.scale.setScalar(s);

        // Float down from above
        const yOffset = (1 - eased) * 1.5;
        meshRef.current.position.y = startY + yOffset;
        return;
      }
      hasEnteredRef.current = true;
      meshRef.current.scale.setScalar(obj.scale);
    }

    // Enhancement #8: Detect new answer feedback
    if (answerFeedback && answerFeedback !== prevFeedbackRef.current) {
      reactionStartRef.current = t;
      reactionTypeRef.current = answerFeedback;
    }
    prevFeedbackRef.current = answerFeedback;

    // Base position reset
    let posY = startY;
    let posX = 0;
    let rotY = 0;
    let rotZ = 0;
    let scale = obj.scale;

    // Enhancement #12: Combination animations with variation
    const speedVar = 0.8 + (startTimeValue / (Math.PI * 2)) * 0.4; // 0.8-1.2x speed
    const ampVar = 0.8 + (startTimeValue / (Math.PI * 2)) * 0.4;

    switch (obj.animation) {
      case "float":
        posY = startY + Math.sin(phase * 1.5 * speedVar) * 0.3 * ampVar;
        // Secondary: slow rotation
        rotY = phase * 0.15;
        break;
      case "rotate":
        rotY = phase * 0.5 * speedVar;
        // Secondary: gentle bob
        posY = startY + Math.sin(phase * 0.8) * 0.08;
        break;
      case "pulse": {
        scale = obj.scale * (1 + Math.sin(phase * 2 * speedVar) * 0.1 * ampVar);
        // Secondary: subtle sway
        rotZ = Math.sin(phase * 0.5) * 0.02;
        break;
      }
      case "sway":
        rotZ = Math.sin(phase * 0.8 * speedVar) * 0.05 * ampVar;
        // Secondary: tiny float
        posY = startY + Math.sin(phase * 1.2) * 0.05;
        break;
    }

    // Enhancement #8: Answer reaction overlay
    if (reactionStartRef.current !== null) {
      const elapsed = t - reactionStartRef.current;
      if (reactionTypeRef.current === "correct" && elapsed < 0.5) {
        // Jump-bounce
        const decay = 1 - elapsed / 0.5;
        posY += Math.abs(Math.sin(elapsed * 12)) * 0.4 * decay;
      } else if (reactionTypeRef.current === "wrong" && elapsed < 0.3) {
        // Rapid X shake
        const decay = 1 - elapsed / 0.3;
        posX += Math.sin(elapsed * 50) * 0.1 * decay;
      } else if (elapsed >= 0.5) {
        reactionStartRef.current = null;
        reactionTypeRef.current = null;
      }
    }

    meshRef.current.position.x = posX;
    meshRef.current.position.y = posY;
    meshRef.current.rotation.y = rotY;
    meshRef.current.rotation.z = rotZ;
    meshRef.current.scale.setScalar(scale);

    // Enhancement #4: Emissive pulse for magical objects
    if (matRef.current && MAGICAL_TYPES.has(obj.type)) {
      const pulse = 0.5 + Math.sin(phase * 2) * 0.5;
      matRef.current.emissiveIntensity = preset.emissiveIntensity * (0.6 + pulse * 0.4);
    }
  });

  const geometry = getGeometry(obj.type);

  return (
    <group position={obj.position}>
      {/* Tree gets a trunk underneath */}
      {obj.type === "tree" && (
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 1.2, 6]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      )}

      {/* Mushroom gets a stem */}
      {obj.type === "mushroom" && (
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.4, 6]} />
          <meshStandardMaterial color="#E8D5B7" />
        </mesh>
      )}

      <mesh ref={meshRef} geometry={geometry} scale={obj.scale} castShadow>
        <meshStandardMaterial
          ref={matRef}
          color={obj.color}
          emissive={obj.emissive || obj.color}
          emissiveIntensity={obj.emissive ? preset.emissiveIntensity : preset.emissiveIntensity * 0.3}
          roughness={preset.roughness}
          metalness={preset.metalness}
          transparent={preset.transparent}
          opacity={preset.opacity}
        />
      </mesh>
    </group>
  );
}
