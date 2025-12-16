import { useRef, useMemo } from 'react';
import { DirectionalLight, Color } from 'three';
import { useFrame } from '@react-three/fiber';

interface DynamicLightingProps {
  timeOfDay: number;
  isNight: boolean;
}

export const DynamicLighting = ({ timeOfDay, isNight }: DynamicLightingProps) => {
  const sunRef = useRef<DirectionalLight>(null);

  // Calculate sun position based on time
  const sunPosition = useMemo(() => {
    // Time 0-24, where 12 is noon
    const normalizedTime = ((timeOfDay - 6) / 12) * Math.PI; // 6am = 0, 6pm = PI
    const height = Math.sin(normalizedTime) * 50;
    const horizontal = Math.cos(normalizedTime) * 50;
    
    return [horizontal, Math.max(5, height), 20] as [number, number, number];
  }, [timeOfDay]);

  // Calculate colors based on time
  const colors = useMemo(() => {
    let sunColor: string;
    let ambientColor: string;
    let ambientIntensity: number;
    let sunIntensity: number;

    if (timeOfDay >= 6 && timeOfDay < 8) {
      // Sunrise
      sunColor = '#ff8844';
      ambientColor = '#332244';
      ambientIntensity = 0.3;
      sunIntensity = 0.5;
    } else if (timeOfDay >= 8 && timeOfDay < 17) {
      // Day
      sunColor = '#ffffee';
      ambientColor = '#445566';
      ambientIntensity = 0.5;
      sunIntensity = 1.2;
    } else if (timeOfDay >= 17 && timeOfDay < 20) {
      // Sunset
      sunColor = '#ff6633';
      ambientColor = '#442233';
      ambientIntensity = 0.3;
      sunIntensity = 0.6;
    } else {
      // Night
      sunColor = '#334466';
      ambientColor = '#111122';
      ambientIntensity = 0.15;
      sunIntensity = 0.2;
    }

    return { sunColor, ambientColor, ambientIntensity, sunIntensity };
  }, [timeOfDay]);

  // Animate fog
  useFrame(({ scene }) => {
    if (isNight) {
      scene.fog = scene.fog || null;
    }
  });

  return (
    <>
      {/* Ambient light - base illumination */}
      <ambientLight 
        color={colors.ambientColor} 
        intensity={colors.ambientIntensity} 
      />

      {/* Directional light - sun/moon */}
      <directionalLight
        ref={sunRef}
        position={sunPosition}
        color={colors.sunColor}
        intensity={colors.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Hemisphere light for more natural outdoor lighting */}
      <hemisphereLight
        color={isNight ? '#112244' : '#87ceeb'}
        groundColor={isNight ? '#001100' : '#1a3a1a'}
        intensity={isNight ? 0.1 : 0.4}
      />

      {/* Moon light at night */}
      {isNight && (
        <directionalLight
          position={[-30, 40, -20]}
          color="#aabbff"
          intensity={0.15}
        />
      )}
    </>
  );
};
