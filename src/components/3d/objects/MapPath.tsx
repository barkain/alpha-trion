import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";
import { MAP_PATH_WAYPOINTS } from "../../../config/mapConstants";

type SegmentState = "golden" | "silver" | "locked";

const SEGMENT_INDICES: [number, number, number][] = [
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 8],
];

function useSegmentGeometries() {
  return useMemo(() => {
    return SEGMENT_INDICES.map(([a, b, c]) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(...MAP_PATH_WAYPOINTS[a]),
        new THREE.Vector3(...MAP_PATH_WAYPOINTS[b]),
        new THREE.Vector3(...MAP_PATH_WAYPOINTS[c]),
      ]);
      const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.12, 6, false);
      const glowGeometry = new THREE.TubeGeometry(curve, 32, 0.35, 6, false);
      return { tubeGeometry, glowGeometry };
    });
  }, []);
}

function getSegmentState(
  segmentIndex: number,
  worldProgress: { completed: boolean; score: number; stars: number }[],
): SegmentState {
  const fromWorld = segmentIndex;
  const toWorld = segmentIndex + 1;

  const isUnlocked = (idx: number) =>
    idx === 0 || worldProgress[idx - 1].completed;

  const fromCompleted = worldProgress[fromWorld].completed;
  const toUnlocked = isUnlocked(toWorld);

  if (!toUnlocked) return "locked";
  if (fromCompleted) return "golden";
  return "silver";
}

function PathSegment({
  segmentIndex,
  tubeGeometry,
  glowGeometry,
  state,
  materialRef,
}: {
  segmentIndex: number;
  tubeGeometry: THREE.TubeGeometry;
  glowGeometry: THREE.TubeGeometry;
  state: SegmentState;
  materialRef: (mat: THREE.MeshStandardMaterial | null) => void;
}) {
  return (
    <group key={segmentIndex}>
      <mesh geometry={tubeGeometry}>
        {state === "golden" && (
          <meshStandardMaterial
            ref={materialRef}
            color="#FFD700"
            emissive="#FFA500"
            emissiveIntensity={0.8}
            metalness={0.6}
            roughness={0.3}
          />
        )}
        {state === "silver" && (
          <meshStandardMaterial
            color="#b8b8b8"
            emissive="#666666"
            emissiveIntensity={0.2}
            roughness={0.5}
          />
        )}
        {state === "locked" && (
          <meshStandardMaterial
            color="#333333"
            opacity={0.3}
            transparent
            roughness={0.8}
          />
        )}
      </mesh>

      {state === "golden" && (
        <mesh geometry={glowGeometry}>
          <meshBasicMaterial
            color="#FFD700"
            opacity={0.08}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function MapPath() {
  const worldProgress = useGameStore((s) => s.worldProgress);
  const geometries = useSegmentGeometries();

  const materialRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const segmentStates = SEGMENT_INDICES.map((_, i) =>
    getSegmentState(i, worldProgress),
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < 4; i++) {
      const mat = materialRefs.current[i];
      if (mat && segmentStates[i] === "golden") {
        mat.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.3;
      }
    }
  });

  return (
    <group>
      {SEGMENT_INDICES.map((_, i) => (
        <PathSegment
          key={i}
          segmentIndex={i}
          tubeGeometry={geometries[i].tubeGeometry}
          glowGeometry={geometries[i].glowGeometry}
          state={segmentStates[i]}
          materialRef={(mat) => {
            materialRefs.current[i] = mat;
          }}
        />
      ))}
    </group>
  );
}
