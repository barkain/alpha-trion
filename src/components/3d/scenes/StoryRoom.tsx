import { SubSceneWrapper } from "./SubSceneWrapper";
import { MagicFog } from "../effects/MagicFog";
import { FloatingParticles } from "../effects/FloatingParticles";

export function StoryRoom({ active }: { active: boolean }) {
  return (
    <SubSceneWrapper active={active}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>

      {/* Bookshelf left */}
      <mesh position={[-4, 2, -3]} castShadow>
        <boxGeometry args={[1.5, 4, 0.8]} />
        <meshStandardMaterial color="#5c3a1e" />
      </mesh>

      {/* Bookshelf right */}
      <mesh position={[4, 2, -3]} castShadow>
        <boxGeometry args={[1.5, 4, 0.8]} />
        <meshStandardMaterial color="#5c3a1e" />
      </mesh>

      {/* Desk */}
      <mesh position={[0, 0.8, -1]} castShadow>
        <boxGeometry args={[3, 0.15, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Candle lights */}
      <pointLight position={[-1, 1.5, -1]} intensity={0.8} color="#FFA500" distance={5} />
      <pointLight position={[1, 1.5, -1]} intensity={0.6} color="#FFD700" distance={4} />
      <pointLight position={[0, 1.5, 0.5]} intensity={0.4} color="#FF8C00" distance={3} />

      {/* Warm fog */}
      <MagicFog color="#4a2810" count={20} strengthOverride={0.7} active={active} />

      {/* Golden particles */}
      <FloatingParticles count={20} color="#FFD700" spread={8} />
    </SubSceneWrapper>
  );
}
