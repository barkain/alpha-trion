import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";

interface MagicFogProps {
  color?: string;
  count?: number;
  strengthOverride?: number;
  active?: boolean;
}

/** Volumetric fog particles that thin out as the player answers correctly */
export function MagicFog({
  color = "#4a1942",
  count = 60,
  strengthOverride,
  active = true,
}: MagicFogProps) {
  const fogStrength = useGameStore((s) => s.fogStrength);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const baseX = (Math.random() - 0.5) * 20;
        const baseY = Math.random() * 4 + 0.5;
        const baseZ = (Math.random() - 0.5) * 20;
        const scale = 1 + Math.random() * 3;

        return {
          baseX,
          baseY,
          baseZ,
          scaleX: scale,
          scaleY: scale * 0.4,
          scaleZ: scale,
          speed: 0.3 + Math.random() * 0.5,
          offset: Math.random() * Math.PI * 2,
        };
      }),
    [count],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    const strength = active === false ? 0 : (strengthOverride ?? fogStrength);

    particles.forEach((p, i) => {
      dummy.position.set(
        p.baseX + Math.sin(t * 0.1 + p.offset) * 0.5,
        p.baseY + Math.sin(t * p.speed + p.offset) * 0.5,
        p.baseZ,
      );
      dummy.scale.set(p.scaleX, p.scaleY, p.scaleZ);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;

    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = strength * (0.05 + Math.sin(t * 0.4) * 0.03);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
