import { useRef, useMemo } from 'react';
import { Mesh, PlaneGeometry, MeshStandardMaterial, RepeatWrapping, TextureLoader } from 'three';
import { useFrame } from '@react-three/fiber';

interface GroundProps {
  size: number;
}

export const Ground = ({ size }: GroundProps) => {
  const meshRef = useRef<Mesh>(null);

  const geometry = useMemo(() => new PlaneGeometry(size, size, 64, 64), [size]);

  // Create grass-like variation
  useMemo(() => {
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] = Math.random() * 0.5; // Small height variation
    }
    geometry.computeVertexNormals();
  }, [geometry]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color="#1a3a1a"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};
