import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";

/** Volumetric fog particles that thin out as the player answers correctly */
export function MagicFog({ color = "#4a1942", count = 60 }) {
  const fogStrength = useGameStore((s) => s.fogStrength);
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<
    Array<{ mesh: THREE.Mesh; speed: number; baseY: number; offset: number }>
  >([]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Fade the entire fog group based on game progress
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshBasicMaterial;
        const t = clock.getElapsedTime();
        const data = particlesRef.current[i];
        if (!data) return;

        // Gentle floating motion
        child.position.y = data.baseY + Math.sin(t * data.speed + data.offset) * 0.5;
        child.position.x += Math.sin(t * 0.1 + data.offset) * 0.002;

        // Opacity tied to fog strength
        mat.opacity = fogStrength * (0.05 + Math.sin(t * data.speed) * 0.03);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const x = (Math.random() - 0.5) * 20;
        const y = Math.random() * 4 + 0.5;
        const z = (Math.random() - 0.5) * 20;
        const scale = 1 + Math.random() * 3;

        // Store particle data for animation
        if (particlesRef.current.length <= i) {
          particlesRef.current.push({
            mesh: null as unknown as THREE.Mesh,
            speed: 0.3 + Math.random() * 0.5,
            baseY: y,
            offset: Math.random() * Math.PI * 2,
          });
        }

        return (
          <mesh key={i} position={[x, y, z]} scale={[scale, scale * 0.4, scale]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.08}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
