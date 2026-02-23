import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../../stores/gameStore";

const WORLD_COLORS = [
  new THREE.Color("#4ade80"), // Forest — green
  new THREE.Color("#a855f7"), // Cave — purple
  new THREE.Color("#fbbf24"), // Library — golden
  new THREE.Color("#60a5fa"), // Tower — blue
  new THREE.Color("#FFD700"), // Palace — gold
];

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float angle = atan(center.y, center.x);

  // Concentric rings
  float rings = sin(dist * 30.0 - uTime * 2.0) * 0.5 + 0.5;
  rings *= smoothstep(0.5, 0.3, dist);

  // Rune-like radial pattern
  float runes = sin(angle * 6.0 + uTime) * sin(angle * 10.0 - uTime * 0.5);
  runes = smoothstep(0.3, 0.8, runes) * smoothstep(0.5, 0.2, dist);

  // Combine
  float pattern = rings * 0.6 + runes * 0.4;
  float alpha = pattern * smoothstep(0.5, 0.1, dist) * uOpacity;

  gl_FragColor = vec4(uColor, alpha * 0.5);
}
`;

interface MagicCircleProps {
  worldIndex: number;
}

/** Enhancement #11: Animated magic circle on the ground */
export function MagicCircle({ worldIndex }: MagicCircleProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const fogStrength = useGameStore((s) => s.fogStrength);
  const color = WORLD_COLORS[worldIndex] ?? WORLD_COLORS[0];

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: color },
      uOpacity: { value: 0 },
    }),
    [color],
  );

  useFrame((_, delta) => {
    if (!shaderRef.current) return;
    shaderRef.current.uniforms.uTime.value += delta;
    shaderRef.current.uniforms.uColor.value = color;
    shaderRef.current.uniforms.uOpacity.value = 1 - fogStrength;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[12, 12]} />
      <shaderMaterial
        ref={shaderRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}
