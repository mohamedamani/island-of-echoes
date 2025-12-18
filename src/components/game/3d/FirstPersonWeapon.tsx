import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface FirstPersonWeaponProps {
  weaponType: 'hands' | 'axe' | 'spear' | 'knife';
  isAttacking: boolean;
}

export const FirstPersonWeapon = ({ weaponType, isAttacking }: FirstPersonWeaponProps) => {
  const groupRef = useRef<Group>(null);
  const swingRef = useRef(0);
  const bobRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Idle bob animation
    bobRef.current += delta * 2;
    const idleBob = Math.sin(bobRef.current) * 0.02;
    const idleSway = Math.cos(bobRef.current * 0.5) * 0.01;

    // Attack animation
    if (isAttacking && swingRef.current < 1) {
      swingRef.current += delta * 8;
    } else if (!isAttacking && swingRef.current > 0) {
      swingRef.current -= delta * 4;
    }
    swingRef.current = Math.max(0, Math.min(1, swingRef.current));

    const swingAngle = Math.sin(swingRef.current * Math.PI) * 0.8;
    const swingForward = Math.sin(swingRef.current * Math.PI) * 0.3;

    groupRef.current.rotation.x = -0.3 + swingAngle;
    groupRef.current.position.z = -0.5 - swingForward;
    groupRef.current.position.y = -0.3 + idleBob;
    groupRef.current.position.x = 0.4 + idleSway;
  });

  const renderWeapon = () => {
    switch (weaponType) {
      case 'axe':
        return (
          <group>
            {/* Handle */}
            <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0.2]}>
              <cylinderGeometry args={[0.02, 0.025, 0.6, 8]} />
              <meshStandardMaterial color="#5c4033" roughness={0.9} />
            </mesh>
            {/* Axe head */}
            <mesh position={[0.08, 0, 0]}>
              <boxGeometry args={[0.15, 0.02, 0.12]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Blade */}
            <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.08, 0.12, 0.01]} />
              <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );

      case 'spear':
        return (
          <group rotation={[0.3, 0, 0.1]}>
            {/* Shaft */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.02, 1.5, 8]} />
              <meshStandardMaterial color="#5c4033" roughness={0.9} />
            </mesh>
            {/* Spear tip */}
            <mesh position={[0, 0.8, 0]}>
              <coneGeometry args={[0.04, 0.2, 8]} />
              <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Binding */}
            <mesh position={[0, 0.65, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </mesh>
          </group>
        );

      case 'knife':
        return (
          <group rotation={[0.5, 0, 0.3]}>
            {/* Handle */}
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.03, 0.12, 0.02]} />
              <meshStandardMaterial color="#5c4033" roughness={0.8} />
            </mesh>
            {/* Guard */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.06, 0.01, 0.03]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Blade */}
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.025, 0.18, 0.005]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        );

      default: // hands
        return (
          <group>
            {/* Right hand */}
            <group position={[0, 0, 0]}>
              {/* Palm */}
              <mesh>
                <boxGeometry args={[0.08, 0.04, 0.1]} />
                <meshStandardMaterial color="#deb887" roughness={0.6} />
              </mesh>
              {/* Fingers */}
              {[0, 1, 2, 3].map((i) => (
                <mesh key={i} position={[-0.025 + i * 0.02, 0, 0.07]}>
                  <boxGeometry args={[0.015, 0.02, 0.05]} />
                  <meshStandardMaterial color="#deb887" roughness={0.6} />
                </mesh>
              ))}
              {/* Thumb */}
              <mesh position={[0.05, 0, 0.02]} rotation={[0, 0.5, 0]}>
                <boxGeometry args={[0.02, 0.02, 0.04]} />
                <meshStandardMaterial color="#deb887" roughness={0.6} />
              </mesh>
            </group>
          </group>
        );
    }
  };

  return (
    <group ref={groupRef} position={[0.4, -0.3, -0.5]}>
      {renderWeapon()}
    </group>
  );
};
