import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useStoryTransition } from "../../../hooks/useStoryTransition";

const STEP_0_POS = new THREE.Vector3(0, 2, 6);
const STEP_1_POS = new THREE.Vector3(-2, 3, 8);
const STEP_2_POS = new THREE.Vector3(0, 2.5, 5);
const LOOK_AT = new THREE.Vector3(0, 1, 0);

export function StoryCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const progress = useStoryTransition();

  useFrame(() => {
    if (!cameraRef.current) return;

    const t = progress;
    const pos = new THREE.Vector3();

    if (t <= 1) {
      pos.lerpVectors(STEP_0_POS, STEP_1_POS, t);
    } else {
      pos.lerpVectors(STEP_1_POS, STEP_2_POS, t - 1);
    }

    cameraRef.current.position.set(pos.x, pos.y, pos.z);
    cameraRef.current.lookAt(LOOK_AT);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={55}
      near={0.1}
      far={100}
    />
  );
}
