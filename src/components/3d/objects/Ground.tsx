import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GroundProps {
  color?: string;
  worldIndex?: number;
}

/** Enhancement #10: Terrain with vertex displacement and ground fog */
export function Ground({ color = "#1a472a", worldIndex = 0 }: GroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const fogPlaneRef = useRef<THREE.Mesh>(null);

  // Apply vertex displacement once on mount
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 30, 64, 64);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const baseColor = new THREE.Color(color);
    const darkColor = baseColor.clone().multiplyScalar(0.6);
    const lightColor = baseColor.clone().multiplyScalar(1.3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      // Layered sine-wave displacement for gentle hills
      const height =
        Math.sin(x * 0.3 + worldIndex) * 0.4 +
        Math.sin(y * 0.5 + worldIndex * 2) * 0.3 +
        Math.sin(x * 0.8 + y * 0.6) * 0.15;

      positions.setZ(i, height);

      // Vertex color gradient: darker valleys, lighter peaks
      const t = (height + 0.7) / 1.4; // Normalize to 0-1
      const vertexColor = darkColor.clone().lerp(lightColor, Math.max(0, Math.min(1, t)));
      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [color, worldIndex]);

  // Animate ground fog layer
  useFrame(({ clock }) => {
    if (fogPlaneRef.current) {
      const mat = fogPlaneRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + Math.sin(clock.getElapsedTime() * 0.3) * 0.015;
    }
  });

  return (
    <group>
      {/* Main terrain */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          vertexColors
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ground fog layer */}
      <mesh
        ref={fogPlaneRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.1, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
