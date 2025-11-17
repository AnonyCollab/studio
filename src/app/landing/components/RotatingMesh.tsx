'use client';

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const NeonMesh = () => {
  const solidMeshRef = useRef<THREE.Mesh>(null);
  const wireMeshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.4, 3), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rotation = time * 0.35;
    const bob = Math.sin(time * 1.2) * 0.25;

    if (solidMeshRef.current && wireMeshRef.current) {
      solidMeshRef.current.rotation.set(rotation * 0.6, rotation, rotation * 0.45);
      wireMeshRef.current.rotation.copy(solidMeshRef.current.rotation);
      solidMeshRef.current.position.y = bob;
      wireMeshRef.current.position.y = bob;
    }
  });

  return (
    <group>
      <mesh ref={solidMeshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#1A2658"
          emissive="#43F0FF"
          emissiveIntensity={1.25}
          roughness={0.18}
          metalness={0.55}
        />
      </mesh>
      <mesh ref={wireMeshRef} geometry={geometry}>
        <meshBasicMaterial color="#bf46ff" wireframe transparent opacity={0.6} />
      </mesh>
      <points geometry={geometry}>
        <pointsMaterial
          size={0.045}
          color="#f3a7ff"
          sizeAttenuation
          transparent
          opacity={0.9}
        />
      </points>
    </group>
  );
};

const RotatingMesh = () => {
  return (
    <div className="relative flex h-[480px] w-full items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 52 }} className="h-full w-full">
        <color attach="background" args={["#05061A"]} />
        <ambientLight intensity={0.65} />
        <pointLight position={[6, 4, 6]} intensity={1.6} color="#7ee8fa" />
        <pointLight position={[-5, -4, -6]} intensity={1.2} color="#f35fd0" />
        <hemisphereLight args={["#0ea5e9", "#020617", 0.6]} />
        <Suspense fallback={null}>
          <NeonMesh />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(111,140,255,0.45)_0%,rgba(13,9,26,0)_60%)]" />
    </div>
  );
};

export default RotatingMesh;
