import { useRef, useMemo } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface TreeProps {
  position: [number, number, number];
  scale?: number;
  type?: 'pine' | 'oak' | 'dead';
}

export const Tree = ({ position, scale = 1, type = 'pine' }: TreeProps) => {
  const groupRef = useRef<Group>(null);
  
  // Gentle sway animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
    }
  });

  const trunkColor = type === 'dead' ? '#3a2a1a' : '#4a3020';
  const foliageColor = type === 'dead' ? '#2a1a0a' : type === 'pine' ? '#0a3a0a' : '#1a4a1a';

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, 3, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={1} />
      </mesh>

      {type === 'pine' && (
        <>
          {/* Pine foliage - layered cones */}
          <mesh position={[0, 3.5, 0]} castShadow>
            <coneGeometry args={[1.2, 2, 8]} />
            <meshStandardMaterial color={foliageColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 4.5, 0]} castShadow>
            <coneGeometry args={[0.9, 1.5, 8]} />
            <meshStandardMaterial color={foliageColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 5.3, 0]} castShadow>
            <coneGeometry args={[0.6, 1.2, 8]} />
            <meshStandardMaterial color={foliageColor} roughness={0.8} />
          </mesh>
        </>
      )}

      {type === 'oak' && (
        <mesh position={[0, 4, 0]} castShadow>
          <sphereGeometry args={[2, 16, 16]} />
          <meshStandardMaterial color={foliageColor} roughness={0.9} />
        </mesh>
      )}

      {type === 'dead' && (
        <>
          {/* Dead branches */}
          <mesh position={[0.5, 2.5, 0]} rotation={[0, 0, 0.5]} castShadow>
            <cylinderGeometry args={[0.05, 0.1, 1.5, 6]} />
            <meshStandardMaterial color={trunkColor} roughness={1} />
          </mesh>
          <mesh position={[-0.3, 3, 0.2]} rotation={[0.3, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.04, 0.08, 1, 6]} />
            <meshStandardMaterial color={trunkColor} roughness={1} />
          </mesh>
        </>
      )}
    </group>
  );
};
