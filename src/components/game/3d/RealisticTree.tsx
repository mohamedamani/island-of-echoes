import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface RealisticTreeProps {
  position: [number, number, number];
  type?: 'oak' | 'pine' | 'birch' | 'dead';
  scale?: number;
}

// Oak tree with realistic branches
const OakTree = ({ scale = 1 }: { scale: number }) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle wind sway
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.01;
    }
  });

  const branches = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      rotation: [0.3 + Math.random() * 0.3, (i / 8) * Math.PI * 2 + Math.random() * 0.3, 0] as [number, number, number],
      length: 1.5 + Math.random() * 1,
      thickness: 0.08 + Math.random() * 0.04,
      height: 2 + Math.random() * 1.5,
    }));
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 4, 12]} />
        <meshStandardMaterial color="#4a3728" roughness={0.95} />
      </mesh>
      
      {/* Trunk texture details */}
      {[0, 1, 2, 3].map((i) => (
        <mesh 
          key={`bark-${i}`}
          position={[
            Math.sin(i * 1.5) * 0.25,
            1 + i * 0.8,
            Math.cos(i * 1.5) * 0.25
          ]}
        >
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshStandardMaterial color="#3d2b1f" roughness={1} />
        </mesh>
      ))}

      {/* Branches */}
      {branches.map((branch, i) => (
        <group key={i} position={[0, branch.height, 0]} rotation={branch.rotation}>
          <mesh castShadow>
            <cylinderGeometry args={[branch.thickness * 0.6, branch.thickness, branch.length, 8]} />
            <meshStandardMaterial color="#5c4033" roughness={0.9} />
          </mesh>
          
          {/* Leaves cluster at end of branch */}
          <mesh position={[0, branch.length / 2, 0]}>
            <sphereGeometry args={[0.8 + Math.random() * 0.4, 8, 8]} />
            <meshStandardMaterial 
              color={`hsl(${100 + Math.random() * 30}, ${60 + Math.random() * 20}%, ${25 + Math.random() * 15}%)`}
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Main foliage crown */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#3a5f3a" roughness={0.85} />
      </mesh>
      <mesh position={[0.5, 4, 0.5]} castShadow>
        <sphereGeometry args={[1.5, 10, 10]} />
        <meshStandardMaterial color="#4a7c4a" roughness={0.85} />
      </mesh>
      <mesh position={[-0.5, 4.2, -0.3]} castShadow>
        <sphereGeometry args={[1.3, 10, 10]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.85} />
      </mesh>
    </group>
  );
};

// Pine tree
const PineTree = ({ scale = 1 }: { scale: number }) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 3, 8]} />
        <meshStandardMaterial color="#5c4033" roughness={0.95} />
      </mesh>

      {/* Pine layers */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 2.5 + i * 0.9, 0]} castShadow>
          <coneGeometry args={[1.4 - i * 0.25, 1.2, 8]} />
          <meshStandardMaterial 
            color={`hsl(${140 + i * 5}, ${50 + i * 5}%, ${20 + i * 3}%)`}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Snow on top (optional winter effect) */}
      <mesh position={[0, 6.5, 0]}>
        <coneGeometry args={[0.3, 0.4, 6]} />
        <meshStandardMaterial color="#1a4a1a" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Birch tree with white bark
const BirchTree = ({ scale = 1 }: { scale: number }) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.025;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main trunk - white birch bark */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 5, 10]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
      </mesh>

      {/* Dark bark markings */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(i * 2) * 0.13,
            0.5 + i * 0.6,
            Math.cos(i * 2) * 0.13
          ]}
        >
          <boxGeometry args={[0.08, 0.15, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>
      ))}

      {/* Delicate branches */}
      {[0, 1, 2, 3].map((i) => (
        <group 
          key={i} 
          position={[0, 3 + i * 0.7, 0]} 
          rotation={[0.4, (i / 4) * Math.PI * 2, 0]}
        >
          <mesh>
            <cylinderGeometry args={[0.02, 0.04, 1.5, 6]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.8} />
          </mesh>
          {/* Leaves */}
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#7cb342" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Crown foliage */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 10, 10]} />
        <meshStandardMaterial color="#8bc34a" roughness={0.85} />
      </mesh>
    </group>
  );
};

// Dead tree
const DeadTree = ({ scale = 1 }: { scale: number }) => {
  return (
    <group scale={scale}>
      {/* Gnarled trunk */}
      <mesh position={[0, 1.5, 0]} rotation={[0.1, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.12, 0.25, 3, 8]} />
        <meshStandardMaterial color="#3d3d3d" roughness={1} />
      </mesh>

      {/* Dead branches */}
      {[0, 1, 2].map((i) => (
        <group 
          key={i}
          position={[0, 2 + i * 0.6, 0]}
          rotation={[0.5, (i / 3) * Math.PI * 2, -0.2]}
        >
          <mesh>
            <cylinderGeometry args={[0.02, 0.05, 1, 6]} />
            <meshStandardMaterial color="#4a4a4a" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Broken top */}
      <mesh position={[0.1, 3.2, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshStandardMaterial color="#3d3d3d" roughness={1} />
      </mesh>
    </group>
  );
};

export const RealisticTree = ({ position, type = 'oak', scale = 1 }: RealisticTreeProps) => {
  const TreeComponent = {
    oak: OakTree,
    pine: PineTree,
    birch: BirchTree,
    dead: DeadTree,
  }[type];

  return (
    <group position={position}>
      <TreeComponent scale={scale} />
    </group>
  );
};
