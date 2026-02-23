import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";

const PARTICLE_COUNT = 50;

function generateBurstParticles() {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5; // hemisphere (upward)
    const speed = 2 + Math.random() * 3;
    return {
      vx: Math.cos(theta) * Math.sin(phi) * speed,
      vy: Math.cos(phi) * speed + Math.random() * 2,
      vz: Math.sin(theta) * Math.sin(phi) * speed,
      scale: 0.03 + Math.random() * 0.05,
    };
  });
}

/** Enhancement #5: Gold sparkle burst on correct answer */
export function AnswerBurst() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const answerFeedback = useGameStore((s) => s.answerFeedback);
  const prevFeedbackRef = useRef<string | null>(null);
  const burstStartRef = useRef<number | null>(null);
  const [particles] = useState(generateBurstParticles);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Detect new correct answer
    if (answerFeedback === "correct" && prevFeedbackRef.current !== "correct") {
      burstStartRef.current = t;
    }
    prevFeedbackRef.current = answerFeedback;

    const active = burstStartRef.current !== null;
    const elapsed = active ? t - burstStartRef.current! : 999;

    if (elapsed > 1.5) {
      burstStartRef.current = null;
    }

    const gravity = -4;

    particles.forEach((p, i) => {
      if (active && elapsed <= 1.5) {
        const life = elapsed;
        const fade = Math.max(0, 1 - elapsed / 1.5);
        dummy.position.set(
          p.vx * life,
          p.vy * life + 0.5 * gravity * life * life + 2,
          p.vz * life,
        );
        dummy.scale.setScalar(p.scale * fade);
      } else {
        // Hide particles
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      }
      dummy.rotation.set(t * 3, t * 2, t);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFA500"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
