import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Enemy } from '@/types/game';

interface Enemy3DProps {
  enemy: Enemy;
  worldSize: number;
}

export const Enemy3D = ({ enemy, worldSize }: Enemy3DProps) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Walking animation
      if (enemy.state === 'chase' || enemy.state === 'patrol') {
        groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.1;
      }
      
      // Chase state makes them shake aggressively
      if (enemy.state === 'chase') {
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.1;
      }
    }
  });

  const pos3D: [number, number, number] = [
    enemy.position.x - worldSize / 2,
    0,
    enemy.position.y - worldSize / 2
  ];

  const isChasing = enemy.state === 'chase';
  const isMutant = enemy.type === 'mutant';

  const bodyColor = isMutant 
    ? (isChasing ? '#800080' : '#2f1f4a')
    : (isChasing ? '#8b0000' : '#4a3728');

  const eyeColor = isChasing ? '#ff0000' : '#ffff00';
  const size = isMutant ? 1.3 : 1;

  return (
    <group ref={groupRef} position={pos3D} scale={size}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.5, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>

      {/* Glowing eyes */}
      <mesh position={[0.1, 1.25, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[-0.1, 1.25, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>

      {/* Eye glow */}
      <pointLight
        position={[0, 1.25, 0.3]}
        intensity={isChasing ? 0.5 : 0.2}
        distance={3}
        color={eyeColor}
      />

      {/* Mutant extra arms */}
      {isMutant && (
        <>
          <mesh position={[0.5, 0.7, 0]} rotation={[0, 0, 0.8]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
            <meshStandardMaterial color={bodyColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.5, 0.7, 0]} rotation={[0, 0, -0.8]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
            <meshStandardMaterial color={bodyColor} roughness={0.9} />
          </mesh>
        </>
      )}

      {/* Health bar */}
      {enemy.health < 100 && (
        <group position={[0, 2, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 0.1, 0.05]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[(enemy.health / 100 - 1) * 0.4, 0, 0.01]}>
            <boxGeometry args={[(enemy.health / 100) * 0.8, 0.08, 0.05]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      )}

      {/* Watch indicator */}
      {enemy.state === 'watch' && (
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ffd700" />
        </mesh>
      )}
    </group>
  );
};
