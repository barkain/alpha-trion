import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ReactNode } from "react";

interface SubSceneWrapperProps {
  active: boolean;
  children: ReactNode;
}

export function SubSceneWrapper({ active, children }: SubSceneWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(active ? 1 : 0);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const target = active ? 1 : 0;

    // Skip traversal when already fully faded out and staying inactive
    if (opacityRef.current < 0.01 && target === 0) {
      groupRef.current.visible = false;
      return;
    }

    // Frame-rate independent lerp
    opacityRef.current += (target - opacityRef.current) * (1 - Math.exp(-3 * delta));

    // Snap to zero when close enough
    if (opacityRef.current < 0.01 && target === 0) {
      opacityRef.current = 0;
    }

    groupRef.current.visible = opacityRef.current > 0.01;

    // Traverse all meshes and update material opacity
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
        material.opacity = opacityRef.current;
        material.transparent = opacityRef.current < 1;
      }
    });
  });

  return <group ref={groupRef}>{children}</group>;
}
