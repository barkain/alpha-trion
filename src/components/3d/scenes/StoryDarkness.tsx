import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SubSceneWrapper } from "./SubSceneWrapper";
import { MagicFog } from "../effects/MagicFog";

function generateRocks() {
  return Array.from({ length: 5 }, () => ({
    position: [
      (Math.random() - 0.5) * 12,
      Math.random() * 2,
      -3 - Math.random() * 6,
    ] as [number, number, number],
    rotation: [
      Math.random() * 0.3 - 0.15,
      0,
      Math.random() * 0.3 - 0.15,
    ] as [number, number, number],
    height: 2 + Math.random() * 3,
    radius: 0.3 + Math.random() * 0.5,
  }));
}

function generateCrystals() {
  return Array.from({ length: 4 }, () => ({
    position: [
      (Math.random() - 0.5) * 8,
      1.5 + Math.random() * 3,
      (Math.random() - 0.5) * 8,
    ] as [number, number, number],
    speed: 0.5 + Math.random(),
  }));
}

export function StoryDarkness({ active }: { active: boolean }) {
  const crystalGroupRef = useRef<THREE.Group>(null);

  const [rocks] = useState(generateRocks);
  const [crystals] = useState(generateCrystals);

  useFrame((_state, delta) => {
    if (!crystalGroupRef.current) return;
    crystalGroupRef.current.children.forEach((child, i) => {
      child.rotation.y += crystals[i].speed * delta;
    });
  });

  return (
    <SubSceneWrapper active={active}>
      {/* Corrupted ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.95} />
      </mesh>

      {/* Twisted rock pillars */}
      {rocks.map((rock, i) => (
        <mesh key={i} position={rock.position} rotation={rock.rotation} castShadow>
          <coneGeometry args={[rock.radius, rock.height, 6]} />
          <meshStandardMaterial color="#1a0a2e" roughness={0.8} />
        </mesh>
      ))}

      {/* Eerie purple point lights */}
      <pointLight position={[0, 3, -2]} intensity={0.5} color="#6a0dad" distance={10} />
      <pointLight position={[-4, 2, -4]} intensity={0.3} color="#4a1942" distance={8} />
      <pointLight position={[3, 1, -5]} intensity={0.2} color="#2d1b69" distance={6} />

      {/* Heavy dark fog */}
      <MagicFog color="#1a0a2e" count={40} strengthOverride={1.0} active={active} />

      {/* Floating dark crystals */}
      <group ref={crystalGroupRef}>
        {crystals.map((c, i) => (
          <mesh key={i} position={c.position}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#4a0080" emissive="#2d0050" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    </SubSceneWrapper>
  );
}
