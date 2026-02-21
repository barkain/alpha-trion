import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { MapForest } from "../objects/MapForest";
import { MapPath } from "../objects/MapPath";
import { MapLandmarks } from "../objects/MapLandmarks";
import { MagicFog } from "../effects/MagicFog";
import { FloatingParticles } from "../effects/FloatingParticles";

function MapCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    const t = clock.getElapsedTime();
    cameraRef.current.position.x = Math.sin(t * 0.2) * 0.15;
    cameraRef.current.position.y = 18 + Math.sin(t * 0.15) * 0.1;
    cameraRef.current.lookAt(0, 0, 0);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 18, 12]}
      fov={50}
    />
  );
}

export function MapScene() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        shadows
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Camera with gentle breathing sway */}
          <MapCamera />

          {/* Lighting */}
          <ambientLight intensity={0.25} color="#1a1a5e" />
          <directionalLight
            position={[8, 15, 5]}
            intensity={0.4}
            color="#b8c4ff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <hemisphereLight args={["#1a1a5e", "#0d2818", 0.3]} />

          {/* Fog + Stars */}
          <fog attach="fog" args={["#0a0820", 15, 35]} />
          <Stars
            radius={60}
            depth={40}
            count={400}
            factor={4}
            fade
            speed={0.3}
          />

          {/* Scene components */}
          <MapForest />
          <MapPath />
          <MapLandmarks />
          <FloatingParticles count={60} color="#FFD700" spread={20} />
          <MagicFog color="#0a0820" count={30} strengthOverride={0.4} />

          {/* Postprocessing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.6} intensity={0.8} mipmapBlur />
            <Vignette offset={0.3} darkness={0.7} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
