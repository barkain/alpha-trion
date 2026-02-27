import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";
import { WORLD_3D_POSITIONS, MAP_PATH_WAYPOINTS } from "../../../config/mapConstants";

// Build the full path curve for walk animation
const fullPathPoints = MAP_PATH_WAYPOINTS.map(
  ([x, y, z]) => new THREE.Vector3(x, y, z),
);
const fullCurve = new THREE.CatmullRomCurve3(fullPathPoints, false);

// Map heroWorldIndex (0-4) to curve t-value (0.0-1.0)
// Each world maps to specific waypoints: 0→0, 1→2, 2→4, 3→6, 4→8
const WORLD_T_VALUES = [0, 0.25, 0.5, 0.75, 1.0];

export function HeroCharacter() {
  const heroWorldIndex = useGameStore((s) => s.heroWorldIndex);
  const heroAnimating = useGameStore((s) => s.heroAnimating);
  const setHeroAnimating = useGameStore((s) => s.setHeroAnimating);
  const setHeroAnimationProgress = useGameStore((s) => s.setHeroAnimationProgress);

  const groupRef = useRef<THREE.Group>(null);
  const prevWorldRef = useRef(heroWorldIndex);
  const animStartRef = useRef(0);
  const animFromT = useRef(0);
  const animToT = useRef(0);

  // Detect world change and start walk animation
  const WALK_DURATION = 3;

  // Get hero position
  const targetPos = useMemo(() => {
    const [x, , z] = WORLD_3D_POSITIONS[Math.min(heroWorldIndex, WORLD_3D_POSITIONS.length - 1)];
    return new THREE.Vector3(x, 0.5, z);
  }, [heroWorldIndex]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Check if heroWorldIndex changed — start animation
    if (prevWorldRef.current !== heroWorldIndex && !heroAnimating) {
      animStartRef.current = t;
      animFromT.current = WORLD_T_VALUES[prevWorldRef.current] ?? 0;
      animToT.current = WORLD_T_VALUES[heroWorldIndex] ?? 0;
      setHeroAnimating(true);
      setHeroAnimationProgress(0);
      prevWorldRef.current = heroWorldIndex;
    }

    if (heroAnimating) {
      const elapsed = t - animStartRef.current;
      const progress = Math.min(elapsed / WALK_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const curveT = animFromT.current + (animToT.current - animFromT.current) * eased;
      const pos = fullCurve.getPoint(Math.max(0, Math.min(1, curveT)));

      groupRef.current.position.set(pos.x, 0.5 + Math.sin(t * 8) * 0.05, pos.z);
      setHeroAnimationProgress(progress);

      if (progress >= 1) {
        setHeroAnimating(false);
        groupRef.current.position.set(targetPos.x, 0.5, targetPos.z);
      }
    } else {
      // Idle bob animation at current position
      const bob = Math.sin(t * 2) * 0.08;
      groupRef.current.position.set(targetPos.x, 0.5 + bob, targetPos.z);
    }
  });

  return (
    <group ref={groupRef} position={[targetPos.x, 0.5, targetPos.z]}>
      {/* Body (cylinder) */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.5, 8]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.6} />
      </mesh>

      {/* Head (sphere) */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#ffcc88" roughness={0.5} />
      </mesh>

      {/* Cape (cone) */}
      <mesh position={[0, 0.35, 0.08]} rotation={[0.15, 0, 0]}>
        <coneGeometry args={[0.18, 0.4, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFA500"
          emissiveIntensity={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Golden glow */}
      <pointLight color="#FFD700" intensity={0.8} distance={3} position={[0, 0.5, 0]} />

      {/* Sparkle particles */}
      <SparkleParticles />

      {/* Enhancement #14: Trail particles */}
      <HeroTrail isWalking={heroAnimating} />
    </group>
  );
}

function generateSparkles() {
  return Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * Math.PI * 2,
    speed: 1.5 + Math.random(),
    radius: 0.25 + Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2,
  }));
}

function SparkleParticles() {
  const ref = useRef<THREE.Group>(null);
  const [particles] = useState(generateSparkles);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      if (i >= particles.length) return;
      const p = particles[i];
      child.position.x = Math.cos(p.angle + t * 0.8) * p.radius;
      child.position.y = 0.6 + Math.sin(t * p.speed + p.phase) * 0.3;
      child.position.z = Math.sin(p.angle + t * 0.8) * p.radius;
    });
  });

  return (
    <group ref={ref}>
      {particles.map((_, i) => (
        <mesh key={i} position={[0, 0.6, 0]}>
          <octahedronGeometry args={[0.03, 0]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFA500"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Enhancement #14: Gold trail particles emitted during walk */
const TRAIL_COUNT = 20;

function HeroTrail({ isWalking }: { isWalking: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bufferRef = useRef(0);
  const lastEmitRef = useRef(0);

  // Circular buffer of particle spawn times and positions
  const trailData = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({
      spawnTime: -10,
      x: 0,
      y: 0,
      z: 0,
    })),
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Emit new particles when walking
    if (isWalking && t - lastEmitRef.current > 0.08) {
      const idx = bufferRef.current % TRAIL_COUNT;
      trailData.current[idx] = {
        spawnTime: t,
        x: (Math.random() - 0.5) * 0.15,
        y: 0.1,
        z: (Math.random() - 0.5) * 0.15,
      };
      bufferRef.current++;
      lastEmitRef.current = t;
    }

    trailData.current.forEach((p, i) => {
      const age = t - p.spawnTime;
      if (age < 1 && age >= 0) {
        const fade = 1 - age;
        dummy.position.set(p.x, p.y + age * 0.5, p.z);
        dummy.scale.setScalar(0.03 * fade);
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, TRAIL_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFA500"
        emissiveIntensity={2}
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
