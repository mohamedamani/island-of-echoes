import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Building } from '@/types/game';

interface Building3DProps {
  building: Building;
  worldSize: number;
}

export const Building3D = ({ building, worldSize }: Building3DProps) => {
  const groupRef = useRef<Group>(null);

  // Fire animation
  useFrame((state) => {
    if (groupRef.current && building.type === 'fire') {
      // Flickering light effect handled in the component
    }
  });

  const pos3D: [number, number, number] = [
    building.position.x - worldSize / 2,
    0,
    building.position.y - worldSize / 2
  ];

  const renderBuilding = () => {
    switch (building.type) {
      case 'shelter':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 1, 2]} />
              <meshStandardMaterial color="#5d4e37" roughness={1} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <coneGeometry args={[1.8, 1, 4]} />
              <meshStandardMaterial color="#8b7355" roughness={0.9} />
            </mesh>
          </group>
        );

      case 'fire':
        return (
          <group>
            {/* Fire base (logs) */}
            <mesh position={[0.2, 0.1, 0]} rotation={[0, 0.3, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
              <meshStandardMaterial color="#4a3020" roughness={1} />
            </mesh>
            <mesh position={[-0.2, 0.1, 0]} rotation={[0, -0.3, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
              <meshStandardMaterial color="#4a3020" roughness={1} />
            </mesh>
            
            {/* Fire flames */}
            <mesh position={[0, 0.4, 0]}>
              <coneGeometry args={[0.3, 0.6, 8]} />
              <meshBasicMaterial color="#ff6b35" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <coneGeometry args={[0.2, 0.4, 8]} />
              <meshBasicMaterial color="#ffd93d" transparent opacity={0.9} />
            </mesh>

            {/* Fire light */}
            <pointLight
              position={[0, 0.5, 0]}
              intensity={2}
              distance={10}
              color="#ff8844"
              castShadow
            />
          </group>
        );

      case 'wall':
        return (
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.5, 1.5, 0.3]} />
            <meshStandardMaterial color="#654321" roughness={1} />
          </mesh>
        );

      case 'trap':
        return (
          <group>
            <mesh position={[0, 0.05, 0]} receiveShadow>
              <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
              <meshStandardMaterial color="#8b4513" roughness={1} />
            </mesh>
            {/* Spikes */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 6) * Math.PI * 2) * 0.4,
                  0.2,
                  Math.sin((i / 6) * Math.PI * 2) * 0.4
                ]}
              >
                <coneGeometry args={[0.05, 0.3, 4]} />
                <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
              </mesh>
            ))}
          </group>
        );

      default:
        return (
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef} position={pos3D}>
      {renderBuilding()}
    </group>
  );
};
