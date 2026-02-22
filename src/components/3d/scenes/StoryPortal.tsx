import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SubSceneWrapper } from "./SubSceneWrapper";
import { FloatingParticles } from "../effects/FloatingParticles";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float angle = atan(center.y, center.x);
  float swirl = sin(angle * 3.0 + dist * 10.0 - uTime * 2.0) * 0.5 + 0.5;
  vec3 color = mix(uColor1, uColor2, swirl);
  float alpha = smoothstep(0.5, 0.2, dist);
  gl_FragColor = vec4(color, alpha * 0.8);
}
`;

export function StoryPortal({ active }: { active: boolean }) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color("#FFD700") },
    uColor2: { value: new THREE.Color("#FF6B35") },
  }), []);

  useFrame((_, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <SubSceneWrapper active={active}>
      {/* Portal ring */}
      <mesh position={[0, 2.5, -2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[2, 0.15, 16, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFA500"
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Portal inner surface with swirling shader */}
      <mesh position={[0, 2.5, -2]}>
        <circleGeometry args={[1.85, 64]} />
        <shaderMaterial
          ref={shaderRef}
          transparent
          side={THREE.DoubleSide}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a3e" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Portal glow lights */}
      <pointLight position={[0, 2.5, -1]} intensity={2} color="#FFD700" distance={8} />
      <pointLight position={[0, 2.5, -3]} intensity={1} color="#FFA500" distance={6} />
      <pointLight position={[0, 4.5, -2]} intensity={0.5} color="#FFFFFF" distance={4} />

      {/* Golden particles */}
      <FloatingParticles count={40} color="#FFD700" spread={6} />

      {/* Stone pillars */}
      <mesh position={[-3, 1.5, -2]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#4a4a6a" roughness={0.9} />
      </mesh>
      <mesh position={[3, 1.5, -2]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#4a4a6a" roughness={0.9} />
      </mesh>
    </SubSceneWrapper>
  );
}
