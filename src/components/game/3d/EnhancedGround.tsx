import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, RepeatWrapping, Vector3 } from 'three';

interface EnhancedGroundProps {
  size: number;
}

export const EnhancedGround = ({ size }: EnhancedGroundProps) => {
  const groundRef = useRef<Mesh>(null);

  // Create varied terrain with different ground types
  const terrainPatches = useMemo(() => {
    const patches: { position: [number, number, number]; scale: number; color: string; type: string }[] = [];
    const halfSize = size / 2;

    // Main grass patches
    for (let x = -halfSize; x < halfSize; x += 15) {
      for (let z = -halfSize; z < halfSize; z += 15) {
        patches.push({
          position: [x + Math.random() * 10, 0.01, z + Math.random() * 10],
          scale: 8 + Math.random() * 6,
          color: `hsl(${100 + Math.random() * 30}, ${40 + Math.random() * 20}%, ${20 + Math.random() * 15}%)`,
          type: 'grass'
        });
      }
    }

    // Dirt patches
    for (let i = 0; i < 15; i++) {
      patches.push({
        position: [
          (Math.random() - 0.5) * size * 0.8,
          0.02,
          (Math.random() - 0.5) * size * 0.8
        ],
        scale: 3 + Math.random() * 5,
        color: `hsl(30, ${30 + Math.random() * 20}%, ${15 + Math.random() * 10}%)`,
        type: 'dirt'
      });
    }

    // Rocky patches
    for (let i = 0; i < 10; i++) {
      patches.push({
        position: [
          (Math.random() - 0.5) * size * 0.8,
          0.03,
          (Math.random() - 0.5) * size * 0.8
        ],
        scale: 2 + Math.random() * 3,
        color: `hsl(0, 0%, ${25 + Math.random() * 15}%)`,
        type: 'rock'
      });
    }

    return patches;
  }, [size]);

  // Rocks and stones
  const rocks = useMemo(() => {
    return Array.from({ length: 50 }, () => ({
      position: [
        (Math.random() - 0.5) * size * 0.9,
        0,
        (Math.random() - 0.5) * size * 0.9
      ] as [number, number, number],
      scale: 0.2 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI,
    }));
  }, [size]);

  // Fallen logs
  const logs = useMemo(() => {
    return Array.from({ length: 8 }, () => ({
      position: [
        (Math.random() - 0.5) * size * 0.7,
        0.15,
        (Math.random() - 0.5) * size * 0.7
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
      length: 2 + Math.random() * 3,
    }));
  }, [size]);

  return (
    <group>
      {/* Base ground */}
      <mesh 
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[size, size, 64, 64]} />
        <meshStandardMaterial 
          color="#2d4a2d" 
          roughness={1}
        />
      </mesh>

      {/* Terrain variation patches */}
      {terrainPatches.map((patch, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
          position={patch.position}
          receiveShadow
        >
          <circleGeometry args={[patch.scale, 16]} />
          <meshStandardMaterial 
            color={patch.color}
            roughness={patch.type === 'rock' ? 0.9 : 1}
          />
        </mesh>
      ))}

      {/* Scattered rocks */}
      {rocks.map((rock, i) => (
        <mesh 
          key={`rock-${i}`}
          position={[rock.position[0], rock.scale * 0.4, rock.position[2]]}
          rotation={[Math.random() * 0.3, rock.rotation, Math.random() * 0.3]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[rock.scale, 0]} />
          <meshStandardMaterial 
            color={`hsl(30, 10%, ${20 + Math.random() * 20}%)`}
            roughness={0.95}
          />
        </mesh>
      ))}

      {/* Fallen logs */}
      {logs.map((log, i) => (
        <group 
          key={`log-${i}`}
          position={log.position}
          rotation={[0, log.rotation, Math.PI / 2 + (Math.random() - 0.5) * 0.2]}
        >
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.2, log.length, 8]} />
            <meshStandardMaterial color="#4a3728" roughness={0.95} />
          </mesh>
          {/* Moss patches */}
          {[0, 1, 2].map((j) => (
            <mesh 
              key={j}
              position={[
                0,
                (j - 1) * log.length * 0.3,
                0.12
              ]}
            >
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshStandardMaterial color="#4a7c4a" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Ground fog particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`fog-${i}`}
          position={[
            (Math.random() - 0.5) * size * 0.8,
            0.3 + Math.random() * 0.5,
            (Math.random() - 0.5) * size * 0.8
          ]}
        >
          <sphereGeometry args={[2 + Math.random() * 2, 8, 8]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.03}
          />
        </mesh>
      ))}
    </group>
  );
};
