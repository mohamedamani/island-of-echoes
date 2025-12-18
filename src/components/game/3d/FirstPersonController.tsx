import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Euler, Quaternion } from 'three';
import { PointerLockControls } from '@react-three/drei';

interface FirstPersonControllerProps {
  playerPosition: { x: number; y: number };
  worldSize: number;
  onMove: (direction: { x: number; y: number }) => void;
  sanity: number;
}

export const FirstPersonController = ({ 
  playerPosition, 
  worldSize, 
  onMove,
  sanity 
}: FirstPersonControllerProps) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const keysRef = useRef<Set<string>>(new Set());
  const headBobRef = useRef(0);
  const velocityRef = useRef({ x: 0, z: 0 });

  // Player height
  const playerHeight = 1.7;
  
  // Convert 2D position to 3D
  const pos3D = {
    x: playerPosition.x - worldSize / 2,
    z: playerPosition.y - worldSize / 2
  };

  // Update camera position based on player position
  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Head bob effect when moving
    const isMoving = keysRef.current.size > 0;
    if (isMoving) {
      headBobRef.current += delta * 10;
    }
    const headBob = isMoving ? Math.sin(headBobRef.current) * 0.05 : 0;
    
    // Sanity shake effect
    const sanityShake = sanity < 30 
      ? Math.sin(state.clock.elapsedTime * 15) * ((30 - sanity) / 500) 
      : 0;

    // Set camera position
    camera.position.set(
      pos3D.x + sanityShake,
      playerHeight + headBob,
      pos3D.z
    );

    // Handle movement input
    if (isLocked) {
      const moveSpeed = 1;
      let dx = 0;
      let dz = 0;

      const forward = new Vector3();
      const right = new Vector3();
      
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      
      right.crossVectors(forward, new Vector3(0, 1, 0));

      if (keysRef.current.has('KeyW')) {
        dx += forward.x * moveSpeed;
        dz += forward.z * moveSpeed;
      }
      if (keysRef.current.has('KeyS')) {
        dx -= forward.x * moveSpeed;
        dz -= forward.z * moveSpeed;
      }
      if (keysRef.current.has('KeyA')) {
        dx -= right.x * moveSpeed;
        dz -= right.z * moveSpeed;
      }
      if (keysRef.current.has('KeyD')) {
        dx += right.x * moveSpeed;
        dz += right.z * moveSpeed;
      }

      if (dx !== 0 || dz !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(dx * dx + dz * dz);
        dx = dx / length;
        dz = dz / length;
        
        onMove({ x: dx, y: dz });
      }
    }
  });

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement === gl.domElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerlockchange', handleLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [gl.domElement]);

  return (
    <PointerLockControls 
      ref={controlsRef}
      args={[camera, gl.domElement]}
    />
  );
};
