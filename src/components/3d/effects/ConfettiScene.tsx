import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const PARTICLE_COUNT = 100;

const COLORS = [
  "#FFD700", "#FF6B35", "#FF4081", "#7C4DFF",
  "#00E5FF", "#69F0AE", "#FFA500", "#E040FB",
];

function generateConfetti() {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    return {
      vx: Math.cos(angle) * speed * 0.3,
      vy: speed + Math.random() * 3,
      vz: Math.sin(angle) * speed * 0.3,
      rotSpeed: (Math.random() - 0.5) * 10,
      size: 0.04 + Math.random() * 0.06,
      colorIndex: Math.floor(Math.random() * COLORS.length),
    };
  });
}

function ConfettiParticles() {
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const [particles] = useState(generateConfetti);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const startTime = useRef(-1);

  // Group particles by color for instanced rendering
  const colorGroups = useMemo(() => {
    const groups: Map<number, number[]> = new Map();
    particles.forEach((p, i) => {
      const list = groups.get(p.colorIndex) ?? [];
      list.push(i);
      groups.set(p.colorIndex, list);
    });
    return groups;
  }, [particles]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (startTime.current < 0) startTime.current = t;
    const elapsed = t - startTime.current;
    const gravity = -6;

    colorGroups.forEach((indices, colorIdx) => {
      const mesh = meshRefs.current[colorIdx];
      if (!mesh) return;

      indices.forEach((pi, localIdx) => {
        const p = particles[pi];
        const life = elapsed;
        const fade = Math.max(0, 1 - elapsed / 4);

        if (fade > 0) {
          dummy.position.set(
            p.vx * life,
            p.vy * life + 0.5 * gravity * life * life,
            p.vz * life,
          );
          dummy.rotation.set(
            life * p.rotSpeed,
            life * p.rotSpeed * 0.7,
            life * p.rotSpeed * 0.3,
          );
          dummy.scale.setScalar(p.size * fade);
        } else {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0);
        }

        dummy.updateMatrix();
        mesh.setMatrixAt(localIdx, dummy.matrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <>
      {Array.from(colorGroups.entries()).map(([colorIdx, indices]) => (
        <instancedMesh
          key={colorIdx}
          ref={(el) => { meshRefs.current[colorIdx] = el; }}
          args={[undefined, undefined, indices.length]}
        >
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial
            color={COLORS[colorIdx]}
            emissive={COLORS[colorIdx]}
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </instancedMesh>
      ))}
    </>
  );
}

/** Enhancement #13: Standalone confetti 3D overlay for level/game complete */
export function ConfettiScene() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <Canvas
        style={{ background: "transparent", pointerEvents: "none" }}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        events={() => ({ enabled: false, priority: 0, compute: () => false })}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 4, 3]} intensity={0.8} />
          <ConfettiParticles />
          <EffectComposer>
            <Bloom luminanceThreshold={0.4} intensity={0.5} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
