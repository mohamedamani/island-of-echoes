import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector2, DoubleSide } from 'three';

interface RiverProps {
  worldSize: number;
}

export const River = ({ worldSize }: RiverProps) => {
  const riverRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  // Generate river path using bezier curves
  const riverPath = useMemo(() => {
    const points: { x: number; z: number; width: number }[] = [];
    const segments = 50;
    
    // Create a winding river path
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * worldSize * 0.8;
      const z = Math.sin(t * Math.PI * 3) * worldSize * 0.15 + Math.sin(t * Math.PI * 1.5) * worldSize * 0.1;
      const width = 3 + Math.sin(t * Math.PI * 5) * 1.5;
      points.push({ x, z, width });
    }
    
    return points;
  }, [worldSize]);

  // Create river geometry vertices
  const { positions, uvs, indices } = useMemo(() => {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    riverPath.forEach((point, i) => {
      const nextPoint = riverPath[i + 1] || point;
      const dir = new Vector2(nextPoint.x - point.x, nextPoint.z - point.z).normalize();
      const perpendicular = new Vector2(-dir.y, dir.x);

      // Left vertex
      positions.push(
        point.x + perpendicular.x * point.width,
        -0.1,
        point.z + perpendicular.y * point.width
      );
      // Right vertex
      positions.push(
        point.x - perpendicular.x * point.width,
        -0.1,
        point.z - perpendicular.y * point.width
      );

      // UVs
      uvs.push(0, i / riverPath.length);
      uvs.push(1, i / riverPath.length);

      // Indices
      if (i < riverPath.length - 1) {
        const baseIndex = i * 2;
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
      }
    });

    return {
      positions: new Float32Array(positions),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices)
    };
  }, [riverPath]);

  // Animate water
  useFrame((state, delta) => {
    timeRef.current += delta;
    if (riverRef.current) {
      const material = riverRef.current.material as any;
      if (material.uniforms) {
        material.uniforms.uTime.value = timeRef.current;
      }
    }
  });

  return (
    <group>
      {/* Main river surface */}
      <mesh ref={riverRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-uv"
            count={uvs.length / 2}
            array={uvs}
            itemSize={2}
          />
          <bufferAttribute
            attach="index"
            count={indices.length}
            array={indices}
            itemSize={1}
          />
        </bufferGeometry>
        <meshStandardMaterial
          color="#2d5a7b"
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.3}
          side={DoubleSide}
        />
      </mesh>

      {/* River bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            count={indices.length}
            array={indices}
            itemSize={1}
          />
        </bufferGeometry>
        <meshStandardMaterial color="#3d2b1f" roughness={1} />
      </mesh>

      {/* Rocks along river */}
      {riverPath.filter((_, i) => i % 5 === 0).map((point, i) => (
        <group key={i}>
          <mesh 
            position={[
              point.x + (Math.random() - 0.5) * point.width * 2.5,
              0.1,
              point.z + (Math.random() - 0.5) * 2
            ]}
            rotation={[Math.random() * 0.5, Math.random() * Math.PI, 0]}
          >
            <dodecahedronGeometry args={[0.3 + Math.random() * 0.4, 1]} />
            <meshStandardMaterial 
              color={`hsl(30, 10%, ${20 + Math.random() * 20}%)`}
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Foam/white water at certain points */}
      {riverPath.filter((_, i) => i % 8 === 0).map((point, i) => (
        <mesh 
          key={`foam-${i}`}
          position={[point.x, 0.08, point.z]}
        >
          <circleGeometry args={[0.5 + Math.random() * 0.5, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
};
