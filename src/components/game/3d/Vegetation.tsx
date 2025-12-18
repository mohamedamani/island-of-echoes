import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';

interface VegetationProps {
  worldSize: number;
  playerPosition: { x: number; y: number };
}

// Grass blade component
const GrassPatch = ({ position, count = 100 }: { position: [number, number, number]; count?: number }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const timeRef = useRef(0);

  const grassData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
      scale: 0.3 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    grassData.forEach((grass, i) => {
      dummy.position.set(
        position[0] + grass.x,
        grass.scale * 0.5,
        position[2] + grass.z
      );
      dummy.scale.setScalar(grass.scale);
      dummy.rotation.set(
        Math.sin(timeRef.current * 2 + grass.phase) * 0.1,
        grass.rotation,
        Math.cos(timeRef.current * 1.5 + grass.phase) * 0.05
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <coneGeometry args={[0.03, 0.3, 4]} />
      <meshStandardMaterial color="#4a7c59" roughness={0.8} />
    </instancedMesh>
  );
};

// Flower component
const Flowers = ({ position, count = 30 }: { position: [number, number, number]; count?: number }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const flowerData = useMemo(() => {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8fd8', '#ffffff'];
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      scale: 0.1 + Math.random() * 0.15,
      rotation: Math.random() * Math.PI,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);

  useMemo(() => {
    if (!meshRef.current) return;
    flowerData.forEach((flower, i) => {
      dummy.position.set(
        position[0] + flower.x,
        flower.scale,
        position[2] + flower.z
      );
      dummy.scale.setScalar(flower.scale);
      dummy.rotation.y = flower.rotation;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new Color(flower.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [flowerData, position, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
};

// Bush component
const Bush = ({ position }: { position: [number, number, number] }) => {
  const scale = 0.5 + Math.random() * 0.5;
  
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(i * Math.PI / 2) * 0.3,
            0.3 * scale,
            Math.cos(i * Math.PI / 2) * 0.3
          ]}
          scale={scale}
        >
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial 
            color={`hsl(${120 + Math.random() * 20}, ${50 + Math.random() * 20}%, ${25 + Math.random() * 15}%)`}
            roughness={0.9}
          />
        </mesh>
      ))}
      {/* Berries */}
      {Math.random() > 0.5 && [0, 1, 2].map((i) => (
        <mesh 
          key={`berry-${i}`}
          position={[
            (Math.random() - 0.5) * 0.5,
            0.4 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.5
          ]}
        >
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#c41e3a" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// Fern component
const Fern = ({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<any>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} rotation={[0, (i / 6) * Math.PI * 2, 0.3]}>
          {/* Fern frond */}
          <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, -0.5]}>
            <planeGeometry args={[0.8, 0.15]} />
            <meshStandardMaterial 
              color="#2d5a3d" 
              roughness={0.8}
              side={2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Mushroom component
const Mushroom = ({ position }: { position: [number, number, number] }) => {
  const scale = 0.3 + Math.random() * 0.3;
  const isRed = Math.random() > 0.5;
  
  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.7} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color={isRed ? '#c41e3a' : '#8B4513'} 
          roughness={0.5} 
        />
      </mesh>
      {/* Spots (if red) */}
      {isRed && [0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(i * 1.2) * 0.12,
            0.4,
            Math.cos(i * 1.2) * 0.12
          ]}
        >
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
};

export const Vegetation = ({ worldSize, playerPosition }: VegetationProps) => {
  const vegetationData = useMemo(() => {
    const items: { type: string; position: [number, number, number] }[] = [];
    const halfSize = worldSize / 2;

    // Generate grass patches
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.8;
      const z = (Math.random() - 0.5) * worldSize * 0.8;
      items.push({ type: 'grass', position: [x, 0, z] });
    }

    // Generate flowers
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.8;
      const z = (Math.random() - 0.5) * worldSize * 0.8;
      items.push({ type: 'flowers', position: [x, 0, z] });
    }

    // Generate bushes
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.8;
      const z = (Math.random() - 0.5) * worldSize * 0.8;
      items.push({ type: 'bush', position: [x, 0, z] });
    }

    // Generate ferns
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.8;
      const z = (Math.random() - 0.5) * worldSize * 0.8;
      items.push({ type: 'fern', position: [x, 0, z] });
    }

    // Generate mushrooms
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.8;
      const z = (Math.random() - 0.5) * worldSize * 0.8;
      items.push({ type: 'mushroom', position: [x, 0, z] });
    }

    return items;
  }, [worldSize]);

  return (
    <group>
      {vegetationData.map((item, i) => {
        switch (item.type) {
          case 'grass':
            return <GrassPatch key={i} position={item.position} />;
          case 'flowers':
            return <Flowers key={i} position={item.position} />;
          case 'bush':
            return <Bush key={i} position={item.position} />;
          case 'fern':
            return <Fern key={i} position={item.position} />;
          case 'mushroom':
            return <Mushroom key={i} position={item.position} />;
          default:
            return null;
        }
      })}
    </group>
  );
};
