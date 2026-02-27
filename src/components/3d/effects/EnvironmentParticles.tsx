import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleConfig {
  count: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  geometry: "box" | "octahedron" | "sphere" | "torus";
  geoArgs: number[];
  pattern: "spiral-down" | "twinkle" | "upward-drift" | "orbital" | "wave";
}

/** Enhancement #9: Per-world environmental particles */
const WORLD_PARTICLES: ParticleConfig[] = [
  // World 0: Forest — falling leaves
  {
    count: 20,
    color: "#4ade80",
    emissive: "#166534",
    emissiveIntensity: 0.3,
    geometry: "box",
    geoArgs: [0.08, 0.01, 0.06],
    pattern: "spiral-down",
  },
  // World 1: Cave — crystal sparkles
  {
    count: 25,
    color: "#c084fc",
    emissive: "#9333ea",
    emissiveIntensity: 1.5,
    geometry: "octahedron",
    geoArgs: [0.03],
    pattern: "twinkle",
  },
  // World 2: Library — floating letters
  {
    count: 15,
    color: "#fbbf24",
    emissive: "#f59e0b",
    emissiveIntensity: 0.8,
    geometry: "box",
    geoArgs: [0.04, 0.06, 0.01],
    pattern: "upward-drift",
  },
  // World 3: Tower — magical runes
  {
    count: 20,
    color: "#60a5fa",
    emissive: "#3b82f6",
    emissiveIntensity: 1.2,
    geometry: "torus",
    geoArgs: [0.03, 0.008, 6, 8],
    pattern: "orbital",
  },
  // World 4: Palace — gold dust
  {
    count: 30,
    color: "#FFD700",
    emissive: "#FFA500",
    emissiveIntensity: 1.0,
    geometry: "sphere",
    geoArgs: [0.015, 6, 6],
    pattern: "wave",
  },
];

function createGeometry(config: ParticleConfig): THREE.BufferGeometry {
  switch (config.geometry) {
    case "box":
      return new THREE.BoxGeometry(...config.geoArgs);
    case "octahedron":
      return new THREE.OctahedronGeometry(config.geoArgs[0], 0);
    case "sphere":
      return new THREE.SphereGeometry(...config.geoArgs);
    case "torus":
      return new THREE.TorusGeometry(...config.geoArgs);
  }
}

function generateParticles(count: number) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 16,
    y: Math.random() * 6 + 1,
    z: (Math.random() - 0.5) * 16,
    speed: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    radius: 2 + Math.random() * 4,
  }));
}

interface EnvironmentParticlesProps {
  worldIndex: number;
}

export function EnvironmentParticles({ worldIndex }: EnvironmentParticlesProps) {
  const config = WORLD_PARTICLES[worldIndex] ?? WORLD_PARTICLES[0];
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [particles] = useState(() => generateParticles(config.count));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => createGeometry(config), [config]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      const pt = t * p.speed + p.phase;

      switch (config.pattern) {
        case "spiral-down": {
          const y = ((p.y - t * 0.3 * p.speed) % 6 + 6) % 6 + 0.5;
          dummy.position.set(
            p.x + Math.sin(pt * 0.5) * 0.8,
            y,
            p.z + Math.cos(pt * 0.3) * 0.5,
          );
          dummy.rotation.set(pt, pt * 0.7, pt * 0.3);
          break;
        }
        case "twinkle": {
          dummy.position.set(p.x, p.y, p.z);
          const twinkle = Math.max(0, Math.sin(pt * 3));
          dummy.scale.setScalar(twinkle * 1.5);
          break;
        }
        case "upward-drift": {
          const y = ((p.y + t * 0.2 * p.speed) % 6) + 1;
          dummy.position.set(
            p.x + Math.sin(pt * 0.4) * 0.3,
            y,
            p.z,
          );
          dummy.rotation.set(0, pt * 0.5, Math.sin(pt) * 0.3);
          break;
        }
        case "orbital": {
          const angle = pt * 0.6;
          dummy.position.set(
            Math.cos(angle) * p.radius,
            p.y + Math.sin(pt * 0.8) * 0.5,
            Math.sin(angle) * p.radius,
          );
          dummy.rotation.set(pt, pt * 0.5, 0);
          break;
        }
        case "wave": {
          dummy.position.set(
            p.x + Math.sin(pt * 0.3) * 0.5,
            p.y + Math.sin(pt + p.x * 0.5) * 0.8,
            p.z + Math.cos(pt * 0.2) * 0.3,
          );
          const pulse = 0.5 + Math.sin(pt * 2) * 0.5;
          dummy.scale.setScalar(pulse);
          break;
        }
      }

      if (config.pattern !== "twinkle" && config.pattern !== "wave") {
        dummy.scale.setScalar(1);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, config.count]} key={worldIndex}>
      <meshStandardMaterial
        color={config.color}
        emissive={config.emissive}
        emissiveIntensity={config.emissiveIntensity}
        transparent
        opacity={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
