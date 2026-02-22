import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";
import {
  WORLD_3D_POSITIONS,
  MAP_PATH_WAYPOINTS,
  CLEARING_RADIUS,
  PATH_EXCLUSION_RADIUS,
} from "../../../config/mapConstants";

const TREE_COUNT = 250;
const FOREST_RADIUS = 14;
const CANOPY_PALETTE = ["#0d3b1f", "#1a5e2a", "#0a4a1e", "#133d1a"];
const CANOPY_BRIGHT_PALETTE = ["#1a7a3a", "#2ecc71", "#1a9e4a", "#22b84a"];
const RESTORATION_RADIUS = 5;
const PATH_SAMPLES = 100;

interface TreeData {
  x: number;
  z: number;
  scale: number;
  colorIdx: number;
  offset: number;
}

function generateTrees(): TreeData[] {
  // Build path curve and sample points for exclusion
  const pathPoints = MAP_PATH_WAYPOINTS.map(
    ([x, y, z]) => new THREE.Vector3(x, y, z),
  );
  const curve = new THREE.CatmullRomCurve3(pathPoints, false);
  const pathSamples: { x: number; z: number }[] = [];
  for (let i = 0; i <= PATH_SAMPLES; i++) {
    const point = curve.getPoint(i / PATH_SAMPLES);
    pathSamples.push({ x: point.x, z: point.z });
  }

  const trees: TreeData[] = [];

  while (trees.length < TREE_COUNT) {
    // Random point inside radius-14 circle
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * FOREST_RADIUS;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    // Check clearing exclusion around world positions
    let excluded = false;
    for (const [wx, , wz] of WORLD_3D_POSITIONS) {
      const dx = x - wx;
      const dz = z - wz;
      if (dx * dx + dz * dz < CLEARING_RADIUS * CLEARING_RADIUS) {
        excluded = true;
        break;
      }
    }
    if (excluded) continue;

    // Check path exclusion (xz distance only)
    for (const sample of pathSamples) {
      const dx = x - sample.x;
      const dz = z - sample.z;
      if (dx * dx + dz * dz < PATH_EXCLUSION_RADIUS * PATH_EXCLUSION_RADIUS) {
        excluded = true;
        break;
      }
    }
    if (excluded) continue;

    trees.push({
      x,
      z,
      scale: 0.6 + Math.random() * 1.0,
      colorIdx: Math.floor(Math.random() * CANOPY_PALETTE.length),
      offset: Math.random() * Math.PI * 2,
    });
  }

  return trees;
}

export function MapForest() {
  const canopyRef = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const worldProgress = useGameStore((s) => s.worldProgress);

  const trees = useMemo(() => generateTrees(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute per-instance canopy colors based on restoration (completed worlds brighten nearby trees)
  const canopyColors = useMemo(() => {
    const colors = new Float32Array(TREE_COUNT * 3);
    const darkPalette = CANOPY_PALETTE.map((c) => new THREE.Color(c));
    const brightPalette = CANOPY_BRIGHT_PALETTE.map((c) => new THREE.Color(c));

    trees.forEach((tree, i) => {
      // Check if tree is near any completed world
      let nearCompleted = false;
      for (let w = 0; w < WORLD_3D_POSITIONS.length; w++) {
        if (worldProgress[w]?.completed && worldProgress[w]?.stars > 0) {
          const [wx, , wz] = WORLD_3D_POSITIONS[w];
          const dx = tree.x - wx;
          const dz = tree.z - wz;
          if (dx * dx + dz * dz < RESTORATION_RADIUS * RESTORATION_RADIUS) {
            nearCompleted = true;
            break;
          }
        }
      }

      const palette = nearCompleted ? brightPalette : darkPalette;
      const c = palette[tree.colorIdx];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });
    return colors;
  }, [trees, worldProgress]);

  // Set initial matrices and instance colors
  useEffect(() => {
    if (!canopyRef.current || !trunkRef.current) return;

    // Apply per-instance colors to canopy
    canopyRef.current.instanceColor = new THREE.InstancedBufferAttribute(
      canopyColors,
      3,
    );

    trees.forEach((tree, i) => {
      const { x, z, scale } = tree;

      // Trunk
      dummy.position.set(x, scale * 0.4, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      // Canopy
      dummy.position.set(x, scale * 0.4 + scale * 1.0, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      canopyRef.current!.setMatrixAt(i, dummy.matrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
  }, [trees, canopyColors, dummy]);

  // Animate canopy sway
  useFrame(({ clock }) => {
    if (!canopyRef.current) return;
    const t = clock.getElapsedTime();

    trees.forEach((tree, i) => {
      const { x, z, scale, offset } = tree;
      const swayZ = Math.sin(t * 0.3 + offset) * 0.02;

      dummy.position.set(x, scale * 0.4 + scale * 1.0, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, 0, swayZ);
      dummy.updateMatrix();
      canopyRef.current!.setMatrixAt(i, dummy.matrix);
    });

    canopyRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#0a1f12" roughness={0.95} />
      </mesh>

      {/* Tree trunks */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, TREE_COUNT]}>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
      </instancedMesh>

      {/* Tree canopies */}
      <instancedMesh
        ref={canopyRef}
        args={[undefined, undefined, TREE_COUNT]}
        castShadow
      >
        <coneGeometry args={[0.7, 2.0, 6]} />
        <meshStandardMaterial color="#0d3b1f" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
