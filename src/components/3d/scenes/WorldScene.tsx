import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useGameStore } from "../../../stores/gameStore";
import { WORLDS } from "../../../config";
import { SceneObjectMesh } from "../objects/SceneObjectMesh";
import { Ground } from "../objects/Ground";
import { MagicFog } from "../effects/MagicFog";
import { FloatingParticles } from "../effects/FloatingParticles";

export function WorldScene() {
  const generatedScene = useGameStore((s) => s.generatedScene);
  const currentWorldIndex = useGameStore((s) => s.currentWorldIndex);
  const world = WORLDS[currentWorldIndex];

  const fogColor = generatedScene?.fogColor || world.scene.palette[2];
  const groundColor = generatedScene?.groundColor || world.scene.palette[0];
  const ambientColor = generatedScene?.ambientColor || world.scene.palette[1];

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
        camera={{ position: [0, 3, 8], fov: 55 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} color={ambientColor} />
          <directionalLight
            position={[5, 8, 3]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[0, 4, 0]} intensity={0.5} color="#FFD700" distance={12} />

          {/* Fog */}
          <fog attach="fog" args={[fogColor, 8, 25]} />

          {/* Stars in the sky */}
          <Stars radius={50} depth={30} count={300} factor={3} fade speed={0.5} />

          {/* Ground */}
          <Ground color={groundColor} />

          {/* AI-Generated objects */}
          {generatedScene?.objects.map((obj, i) => (
            <SceneObjectMesh key={i} obj={obj} />
          ))}

          {/* Fog particles */}
          <MagicFog color={fogColor} count={40} />

          {/* Fireflies */}
          <FloatingParticles
            count={30}
            color="#FFD700"
            spread={12}
          />

          {/* Camera orbit — gentle auto-rotate, user can't interact */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
