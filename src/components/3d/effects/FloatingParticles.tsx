import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function generateParticles(count: number, spread: number) {
  return Array.from({ length: count }, () => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      Math.random() * 6,
      (Math.random() - 0.5) * spread,
    ),
    speed: 0.2 + Math.random() * 0.6,
    offset: Math.random() * Math.PI * 2,
    scale: 0.02 + Math.random() * 0.05,
  }));
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  spread?: number;
}

export function FloatingParticles({
  count = 40,
  color = "#FFD700",
  spread = 10,
}: FloatingParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const [particles] = useState(() => generateParticles(count, spread));

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position.y + Math.sin(t * p.speed * 1.3 + p.offset) * 0.3,
        p.position.z + Math.cos(t * p.speed + p.offset) * 0.5,
      );

      const pulse = 1 + Math.sin(t * 3 + p.offset) * 0.3;
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
}
