import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";
import { WORLD_3D_POSITIONS } from "../../../config/mapConstants";

type LandmarkStatus = "completed" | "available" | "locked";

interface LandmarkProps {
  position: [number, number, number];
  status: LandmarkStatus;
  stars: number;
}

// --- Floating Stars (shown above completed landmarks) ---

function FloatingStars({ count, baseY }: { count: number; baseY: number }) {
  const ref = useRef<THREE.Group>(null);

  const [offsets] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      radius: 0.3 + Math.random() * 0.4,
      speed: 0.6 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    })),
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      if (i >= offsets.length) return;
      const o = offsets[i];
      child.position.x = Math.cos(o.angle + t * 0.5) * o.radius;
      child.position.y = baseY + Math.sin(t * o.speed + o.phase) * 0.2;
      child.position.z = Math.sin(o.angle + t * 0.5) * o.radius;
    });
  });

  return (
    <group ref={ref}>
      {offsets.map((_, i) => (
        <mesh key={i} position={[0, baseY, 0]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFA500"
            emissiveIntensity={1.0}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- Locked overlay sphere ---

function LockedOverlay() {
  return (
    <mesh position={[0, 1.5, 0]}>
      <sphereGeometry args={[1.5, 12, 12]} />
      <meshBasicMaterial
        color="#111122"
        opacity={0.4}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// --- World 0: Giant Ancient Tree (Forest) ---

function ForestLandmark({ position, status, stars }: LandmarkProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const locked = status === "locked";
  const emissiveMult = status === "completed" ? 1.0 : status === "available" ? 0.6 : 0;

  const trunkColor = locked ? "#222233" : "#3d2b1f";
  const canopyColor = locked ? "#222233" : "#1a5e2a";
  const canopyEmissive = locked ? "#000000" : "#2ECC71";
  const rootEmissive = locked ? "#000000" : "#2ECC71";

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    if (status === "completed") {
      lightRef.current.intensity = 1.0;
    } else if (status === "available") {
      lightRef.current.intensity = 0.4 + Math.sin(t * 2) * 0.2;
    } else {
      lightRef.current.intensity = 0;
    }
  });

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 2.5, 8]} />
        <meshStandardMaterial
          color={trunkColor}
          roughness={0.9}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Bottom canopy */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <coneGeometry args={[1.8, 1.5, 8]} />
        <meshStandardMaterial
          color={canopyColor}
          emissive={canopyEmissive}
          emissiveIntensity={0.3 * emissiveMult}
        />
      </mesh>

      {/* Middle canopy */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <coneGeometry args={[1.3, 1.2, 8]} />
        <meshStandardMaterial
          color={canopyColor}
          emissive={canopyEmissive}
          emissiveIntensity={0.3 * emissiveMult}
        />
      </mesh>

      {/* Top canopy */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[0.8, 1.0, 8]} />
        <meshStandardMaterial
          color={canopyColor}
          emissive={canopyEmissive}
          emissiveIntensity={0.3 * emissiveMult}
        />
      </mesh>

      {/* Glowing torus roots */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.08, 8, 20]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#3d2b1f"}
          emissive={rootEmissive}
          emissiveIntensity={0.5 * emissiveMult}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color="#2ECC71"
        intensity={0}
        distance={6}
        position={[0, 3, 0]}
      />

      {locked && <LockedOverlay />}
      {status === "completed" && stars > 0 && (
        <FloatingStars count={stars} baseY={5.2} />
      )}
    </group>
  );
}

// --- World 1: Crystal Cluster (Cave) ---

const CRYSTAL_OFFSETS = [
  { x: 0, y: 1.2, z: 0, rx: 0.2, rz: 0.1, scale: 1.5 },
  { x: 0.4, y: 0.8, z: 0.3, rx: 0.4, rz: -0.3, scale: 1.2 },
  { x: -0.3, y: 0.9, z: -0.4, rx: -0.3, rz: 0.5, scale: 1.0 },
  { x: -0.5, y: 0.6, z: 0.2, rx: 0.6, rz: -0.2, scale: 0.8 },
  { x: 0.3, y: 0.5, z: -0.3, rx: -0.1, rz: 0.4, scale: 0.9 },
];

function CrystalLandmark({ position, status, stars }: LandmarkProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const locked = status === "locked";
  const emissiveMult = status === "completed" ? 1.0 : status === "available" ? 0.6 : 0;

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    if (status === "completed") {
      lightRef.current.intensity = 1.0;
    } else if (status === "available") {
      lightRef.current.intensity = 0.4 + Math.sin(t * 2) * 0.2;
    } else {
      lightRef.current.intensity = 0;
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.3, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#2d1b4e"}
          roughness={0.6}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Crystal shards */}
      {CRYSTAL_OFFSETS.map((c, i) => (
        <mesh
          key={i}
          position={[c.x, c.y, c.z]}
          rotation={[c.rx, 0, c.rz]}
          scale={c.scale}
        >
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={locked ? "#222233" : "#8b5cf6"}
            emissive={locked ? "#000000" : "#6a0dad"}
            emissiveIntensity={0.5 * emissiveMult}
            metalness={locked ? 0 : 0.4}
            roughness={locked ? 0.8 : 0.2}
          />
        </mesh>
      ))}

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color="#9B59B6"
        intensity={0}
        distance={6}
        position={[0, 1.5, 0]}
      />

      {locked && <LockedOverlay />}
      {status === "completed" && stars > 0 && (
        <FloatingStars count={stars} baseY={2.5} />
      )}
    </group>
  );
}

// --- World 2: Floating Books (Library) ---

const BOOK_COLORS = ["#8b4513", "#2d5016", "#1a3a5c", "#6b1a1a"];
const BOOK_BASE_HEIGHTS = [1.0, 1.5, 2.0, 2.5];
const BOOK_TILTS = [0.1, -0.15, 0.2, -0.1];

function BooksLandmark({ position, status, stars }: LandmarkProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const booksRef = useRef<THREE.Group>(null);
  const locked = status === "locked";
  const emissiveMult = status === "completed" ? 1.0 : status === "available" ? 0.6 : 0;

  useFrame(({ clock }) => {
    if (!lightRef.current || !booksRef.current) return;
    const t = clock.getElapsedTime();

    // Animate light
    if (status === "completed") {
      lightRef.current.intensity = 1.0;
    } else if (status === "available") {
      lightRef.current.intensity = 0.4 + Math.sin(t * 2) * 0.2;
    } else {
      lightRef.current.intensity = 0;
    }

    // Animate book floating
    if (!locked) {
      booksRef.current.children.forEach((child, i) => {
        if (i < BOOK_BASE_HEIGHTS.length) {
          child.position.y =
            BOOK_BASE_HEIGHTS[i] + Math.sin(t * 0.8 + i * 1.5) * 0.15;
        }
      });
    }
  });

  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.4, 8]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#4a3728"}
          roughness={0.8}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Floating books */}
      <group ref={booksRef}>
        {BOOK_COLORS.map((color, i) => (
          <mesh
            key={i}
            position={[0, BOOK_BASE_HEIGHTS[i], 0]}
            rotation={[BOOK_TILTS[i], i * 0.8, BOOK_TILTS[i] * 0.5]}
          >
            <boxGeometry args={[0.5, 0.08, 0.35]} />
            <meshStandardMaterial
              color={locked ? "#222233" : color}
              emissive={
                locked ? "#000000" : i === 2 ? "#2ECC71" : "#000000"
              }
              emissiveIntensity={i === 2 ? 0.6 * emissiveMult : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color="#2ECC71"
        intensity={0}
        distance={5}
        position={[0, 2, 0]}
      />

      {locked && <LockedOverlay />}
      {status === "completed" && stars > 0 && (
        <FloatingStars count={stars} baseY={3.2} />
      )}
    </group>
  );
}

// --- World 3: Wizard Tower ---

function TowerLandmark({ position, status, stars }: LandmarkProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const sigilRef = useRef<THREE.Mesh>(null);
  const locked = status === "locked";
  const emissiveMult = status === "completed" ? 1.0 : status === "available" ? 0.6 : 0;

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();

    // Animate light
    if (status === "completed") {
      lightRef.current.intensity = 1.0;
    } else if (status === "available") {
      lightRef.current.intensity = 0.4 + Math.sin(t * 2) * 0.2;
    } else {
      lightRef.current.intensity = 0;
    }

    // Animate sigil rotation
    if (sigilRef.current && !locked) {
      sigilRef.current.rotation.y = t * 0.8;
      sigilRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Tower body */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 3.0, 8]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#4a4a6a"}
          roughness={0.7}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Cone roof */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[0.7, 1.0, 8]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#1a1a5e"}
          roughness={0.6}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Rotating torus ring (sigil) */}
      <mesh ref={sigilRef} position={[0, 2.5, 0]}>
        <torusGeometry args={[0.6, 0.04, 8, 24]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#3498DB"}
          emissive={locked ? "#000000" : "#3498DB"}
          emissiveIntensity={0.8 * emissiveMult}
        />
      </mesh>

      {/* Window lights */}
      <mesh position={[0.42, 1.8, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color={locked ? "#222233" : "#FFD700"} />
      </mesh>
      <mesh position={[0.42, 2.2, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color={locked ? "#222233" : "#FFD700"} />
      </mesh>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color="#3498DB"
        intensity={0}
        distance={6}
        position={[0, 3, 0]}
      />

      {locked && <LockedOverlay />}
      {status === "completed" && stars > 0 && (
        <FloatingStars count={stars} baseY={4.5} />
      )}
    </group>
  );
}

// --- World 4: Golden Palace ---

function PalaceLandmark({ position, status, stars }: LandmarkProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const locked = status === "locked";
  const emissiveMult = status === "completed" ? 1.0 : status === "available" ? 0.6 : 0;

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();

    // Animate light
    if (status === "completed") {
      lightRef.current.intensity = 1.0;
    } else if (status === "available") {
      lightRef.current.intensity = 0.4 + Math.sin(t * 2) * 0.2;
    } else {
      lightRef.current.intensity = 0;
    }

    // Animate floating crown
    if (crownRef.current && !locked) {
      crownRef.current.position.y = 3.2 + Math.sin(t) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Central cylinder */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 2.0, 8]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#b8860b"}
          roughness={0.4}
          metalness={locked ? 0 : 0.6}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Left pillar */}
      <mesh position={[-1.0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 2.5, 6]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#daa520"}
          roughness={0.4}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Right pillar */}
      <mesh position={[1.0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 2.5, 6]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#daa520"}
          roughness={0.4}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Dome */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry
          args={[0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color={locked ? "#222233" : "#FFD700"}
          metalness={locked ? 0 : 0.7}
          roughness={0.3}
          emissive={locked ? "#000000" : "#FFA500"}
          emissiveIntensity={0.4 * emissiveMult}
        />
      </mesh>

      {/* Floating crown */}
      <mesh ref={crownRef} position={[0, 3.2, 0]}>
        <torusGeometry args={[0.4, 0.06, 8, 16]} />
        <meshStandardMaterial
          color={locked ? "#222233" : "#FFD700"}
          emissive={locked ? "#000000" : "#FFA500"}
          emissiveIntensity={0.8 * emissiveMult}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color="#FFD700"
        intensity={0}
        distance={8}
        position={[0, 3, 0]}
      />

      {locked && <LockedOverlay />}
      {status === "completed" && stars > 0 && (
        <FloatingStars count={stars} baseY={4.0} />
      )}
    </group>
  );
}

// --- Restoration Flowers (8 small flowers around completed landmarks) ---

const FLOWER_COLORS = ["#ff69b4", "#ffb6c1", "#ff1493", "#ffd700", "#ff6b9d", "#ff85a2", "#ffa07a", "#ffb347"];

function RestorationFlowers({ position }: { position: [number, number, number] }) {
  const [flowers] = useState(() =>
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 1.8 + Math.random() * 0.8;
      return {
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        color: FLOWER_COLORS[i],
        scale: 0.06 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
      };
    }),
  );

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (i >= flowers.length) return;
      child.position.y = 0.05 + Math.sin(t * 1.5 + flowers[i].phase) * 0.03;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {flowers.map((f, i) => (
        <mesh key={i} position={[f.x, 0.05, f.z]}>
          <sphereGeometry args={[f.scale, 6, 6]} />
          <meshStandardMaterial
            color={f.color}
            emissive={f.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- Main component ---

const LANDMARK_COMPONENTS = [
  ForestLandmark,
  CrystalLandmark,
  BooksLandmark,
  TowerLandmark,
  PalaceLandmark,
];

export function MapLandmarks() {
  const worldProgress = useGameStore((s) => s.worldProgress);

  return (
    <group>
      {LANDMARK_COMPONENTS.map((LandmarkComponent, idx) => {
        const isUnlocked =
          idx === 0 || worldProgress[idx - 1].completed;
        const status: LandmarkStatus = worldProgress[idx].completed
          ? "completed"
          : isUnlocked
            ? "available"
            : "locked";

        return (
          <group key={idx}>
            <LandmarkComponent
              position={WORLD_3D_POSITIONS[idx]}
              status={status}
              stars={worldProgress[idx].stars}
            />
            {/* Restoration flowers around completed landmarks */}
            {status === "completed" && (
              <RestorationFlowers position={WORLD_3D_POSITIONS[idx]} />
            )}
          </group>
        );
      })}
    </group>
  );
}
