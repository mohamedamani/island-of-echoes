import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars, Cloud } from '@react-three/drei';

interface AtmosphereProps {
  timeOfDay: number;
  isNight: boolean;
}

export const Atmosphere = ({ timeOfDay, isNight }: AtmosphereProps) => {
  const fogRef = useRef<Mesh>(null);

  // Calculate sun position for sky
  const sunPosition = (() => {
    const normalizedTime = ((timeOfDay - 6) / 12) * Math.PI;
    const height = Math.sin(normalizedTime);
    const horizontal = Math.cos(normalizedTime);
    return [horizontal * 100, Math.max(-10, height * 100), 50] as [number, number, number];
  })();

  return (
    <>
      {/* Sky dome */}
      {!isNight && (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          inclination={0.5}
          azimuth={0.25}
          rayleigh={isNight ? 0 : 2}
          turbidity={10}
        />
      )}

      {/* Stars at night */}
      {isNight && (
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}

      {/* Clouds */}
      {!isNight && (
        <>
          <Cloud
            position={[-20, 25, -30]}
            opacity={0.5}
            speed={0.4}
          />
          <Cloud
            position={[20, 30, -25]}
            opacity={0.4}
            speed={0.3}
          />
          <Cloud
            position={[0, 28, -40]}
            opacity={0.3}
            speed={0.5}
          />
        </>
      )}

      {/* Ground fog at night */}
      {isNight && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial
            color="#1a2a1a"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </>
  );
};
