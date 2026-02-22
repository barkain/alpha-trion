import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneObject } from "../../../types/game";

interface SceneObjectMeshProps {
  obj: SceneObject;
}

/** Maps SceneObject type → Three.js geometry */
function getGeometry(type: SceneObject["type"]): THREE.BufferGeometry {
  switch (type) {
    case "tree": {
      // Cone (trunk is handled separately)
      return new THREE.ConeGeometry(0.6, 1.8, 6);
    }
    case "rock":
      return new THREE.DodecahedronGeometry(0.5, 0);
    case "crystal":
      return new THREE.OctahedronGeometry(0.5, 0);
    case "book":
      return new THREE.BoxGeometry(0.8, 0.1, 0.6);
    case "tower":
      return new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
    case "orb":
      return new THREE.SphereGeometry(0.3, 16, 16);
    case "mushroom":
      return new THREE.SphereGeometry(0.4, 8, 8);
    case "pillar":
      return new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
    case "arch":
      return new THREE.TorusGeometry(1, 0.15, 8, 16, Math.PI);
    default:
      return new THREE.SphereGeometry(0.3, 8, 8);
  }
}

export function SceneObjectMesh({ obj }: SceneObjectMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startY = obj.position[1];
  const [startTimeValue] = useState(() => Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() + startTimeValue;

    switch (obj.animation) {
      case "float":
        meshRef.current.position.y = startY + Math.sin(t * 1.5) * 0.3;
        break;
      case "rotate":
        meshRef.current.rotation.y = t * 0.5;
        break;
      case "pulse": {
        const s = obj.scale * (1 + Math.sin(t * 2) * 0.1);
        meshRef.current.scale.setScalar(s);
        break;
      }
      case "sway":
        meshRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
        break;
    }
  });

  const geometry = getGeometry(obj.type);

  return (
    <group position={obj.position}>
      {/* Tree gets a trunk underneath */}
      {obj.type === "tree" && (
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 1.2, 6]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      )}

      {/* Mushroom gets a stem */}
      {obj.type === "mushroom" && (
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.4, 6]} />
          <meshStandardMaterial color="#E8D5B7" />
        </mesh>
      )}

      <mesh ref={meshRef} geometry={geometry} scale={obj.scale} castShadow>
        <meshStandardMaterial
          color={obj.color}
          emissive={obj.emissive || "#000000"}
          emissiveIntensity={obj.emissive ? 0.6 : 0}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
