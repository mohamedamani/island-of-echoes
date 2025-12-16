import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface Player3DProps {
  position: { x: number; y: number };
  sanity: number;
  worldSize: number;
}

export const Player3D = ({ position, sanity, worldSize }: Player3DProps) => {
  const groupRef = useRef<Group>(null);

  // Breathing/idle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      
      // Sanity effect - slight shake
      if (sanity < 30) {
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * ((30 - sanity) / 300);
      }
    }
  });

  // Convert 2D position to 3D (y becomes z)
  const pos3D: [number, number, number] = [
    position.x - worldSize / 2,
    0.5,
    position.y - worldSize / 2
  ];

  return (
    <group ref={groupRef} position={pos3D}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#deb887" roughness={0.6} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, 1.15, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.08, 1.15, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Point light for player (torch effect) */}
      <pointLight
        position={[0, 1.5, 0.5]}
        intensity={0.8}
        distance={8}
        color="#ffaa55"
        castShadow
      />

      {/* Sanity visual effect */}
      {sanity < 50 && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#800080"
            transparent
            opacity={(50 - sanity) / 200}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};
