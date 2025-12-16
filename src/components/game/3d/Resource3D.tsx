import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Resource } from '@/types/game';

interface Resource3DProps {
  resource: Resource;
  worldSize: number;
}

export const Resource3D = ({ resource, worldSize }: Resource3DProps) => {
  const groupRef = useRef<Group>(null);

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + resource.position.x) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const pos3D: [number, number, number] = [
    resource.position.x - worldSize / 2,
    0.5,
    resource.position.y - worldSize / 2
  ];

  const renderResource = () => {
    switch (resource.type) {
      case 'wood':
        return (
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
            <meshStandardMaterial color="#8b4513" roughness={0.9} />
          </mesh>
        );
      case 'stone':
        return (
          <mesh castShadow>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#808080" roughness={1} />
          </mesh>
        );
      case 'food':
        return (
          <mesh castShadow rotation={[Math.PI / 4, 0, 0]}>
            <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
            <meshStandardMaterial color="#8b4513" roughness={0.7} />
          </mesh>
        );
      case 'water':
        return (
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.1, 0.4, 8]} />
            <meshStandardMaterial color="#4169e1" roughness={0.3} metalness={0.5} />
          </mesh>
        );
      case 'cloth':
        return (
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.1, 0.3]} />
            <meshStandardMaterial color="#f5f5dc" roughness={1} />
          </mesh>
        );
      case 'metal':
        return (
          <mesh castShadow>
            <torusGeometry args={[0.2, 0.08, 8, 16]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />
          </mesh>
        );
      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#888" />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef} position={pos3D}>
      {renderResource()}
      
      {/* Glow effect */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.3}
        distance={3}
        color={resource.type === 'water' ? '#4169e1' : '#ffcc00'}
      />

      {/* Amount indicator */}
      {resource.amount > 1 && (
        <mesh position={[0.3, 0.3, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
      )}
    </group>
  );
};
