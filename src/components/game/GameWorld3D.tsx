import { useRef, useEffect, Suspense, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, Environment, Stars } from '@react-three/drei';
import { GameState } from '@/types/game';
import { EnhancedGround } from './3d/EnhancedGround';
import { RealisticTree } from './3d/RealisticTree';
import { Vegetation } from './3d/Vegetation';
import { River } from './3d/River';
import { Enemy3D } from './3d/Enemy3D';
import { Resource3D } from './3d/Resource3D';
import { Building3D } from './3d/Building3D';
import { DynamicLighting } from './3d/DynamicLighting';
import { FirstPersonWeapon } from './3d/FirstPersonWeapon';
import { Vector3, Euler } from 'three';
import { useMemo } from 'react';

interface GameWorld3DProps {
  gameState: GameState;
  worldSize: number;
  onCollectResource: (id: string) => void;
  onAttackEnemy: (id: string, damage: number) => void;
}

// First Person Camera Controller
const FirstPersonCamera = ({ 
  playerPosition, 
  worldSize, 
  sanity,
  onMove 
}: { 
  playerPosition: { x: number; y: number }; 
  worldSize: number;
  sanity: number;
  onMove: (dx: number, dy: number) => void;
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const headBobRef = useRef(0);
  const [isLocked, setIsLocked] = useState(false);

  const playerHeight = 1.7;
  
  // Convert 2D position to 3D
  const pos3D = useMemo(() => ({
    x: playerPosition.x - worldSize / 2,
    z: playerPosition.y - worldSize / 2
  }), [playerPosition, worldSize]);

  useFrame((state, delta) => {
    // Head bob effect when moving
    const isMoving = keysRef.current.size > 0 && isLocked;
    if (isMoving) {
      headBobRef.current += delta * 12;
    }
    const headBob = isMoving ? Math.sin(headBobRef.current) * 0.08 : 0;
    
    // Sanity shake effect
    const sanityShake = sanity < 30 
      ? Math.sin(state.clock.elapsedTime * 15) * ((30 - sanity) / 300) 
      : 0;

    // Set camera position
    camera.position.x = pos3D.x + sanityShake;
    camera.position.y = playerHeight + headBob;
    camera.position.z = pos3D.z;

    // Handle movement
    if (isLocked && keysRef.current.size > 0) {
      const moveSpeed = 1.5;
      let dx = 0;
      let dz = 0;

      const forward = new Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      
      const right = new Vector3();
      right.crossVectors(forward, new Vector3(0, 1, 0));

      if (keysRef.current.has('KeyW') || keysRef.current.has('ArrowUp')) {
        dx += forward.x * moveSpeed;
        dz += forward.z * moveSpeed;
      }
      if (keysRef.current.has('KeyS') || keysRef.current.has('ArrowDown')) {
        dx -= forward.x * moveSpeed;
        dz -= forward.z * moveSpeed;
      }
      if (keysRef.current.has('KeyA') || keysRef.current.has('ArrowLeft')) {
        dx -= right.x * moveSpeed;
        dz -= right.z * moveSpeed;
      }
      if (keysRef.current.has('KeyD') || keysRef.current.has('ArrowRight')) {
        dx += right.x * moveSpeed;
        dz += right.z * moveSpeed;
      }

      if (dx !== 0 || dz !== 0) {
        const length = Math.sqrt(dx * dx + dz * dz);
        onMove(dx / length, dz / length);
      }
    }
  });

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
    />
  );
};

// Crosshair component (rendered in 3D space in front of camera)
const Crosshair = () => {
  const { camera } = useThree();
  const ref = useRef<any>(null);

  useFrame(() => {
    if (ref.current) {
      // Position crosshair in front of camera
      const forward = new Vector3(0, 0, -2);
      forward.applyQuaternion(camera.quaternion);
      ref.current.position.copy(camera.position).add(forward);
      ref.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={ref}>
      {/* Horizontal line */}
      <mesh>
        <boxGeometry args={[0.03, 0.002, 0.001]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      {/* Vertical line */}
      <mesh>
        <boxGeometry args={[0.002, 0.03, 0.001]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.003, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
};

// First person weapon view
const WeaponView = ({ inventory, isAttacking }: { inventory: any[]; isAttacking: boolean }) => {
  const { camera } = useThree();
  const ref = useRef<any>(null);

  const weaponType = useMemo(() => {
    if (inventory.some(i => i.type === 'axe')) return 'axe';
    if (inventory.some(i => i.type === 'spear')) return 'spear';
    return 'hands';
  }, [inventory]);

  useFrame(() => {
    if (ref.current) {
      // Position weapon relative to camera
      ref.current.position.copy(camera.position);
      ref.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={ref}>
      <FirstPersonWeapon weaponType={weaponType} isAttacking={isAttacking} />
    </group>
  );
};

// Generate forest
const RealisticForest = ({ worldSize, playerPosition }: { worldSize: number; playerPosition: { x: number; y: number } }) => {
  const trees = useMemo(() => {
    const treeList: { position: [number, number, number]; type: 'oak' | 'pine' | 'birch' | 'dead'; scale: number }[] = [];
    const halfSize = worldSize / 2;
    
    // Generate more trees
    for (let i = 0; i < 150; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.9;
      const z = (Math.random() - 0.5) * worldSize * 0.9;
      
      // Don't place trees too close to center (spawn area)
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
      
      // Avoid river area (roughly center horizontal)
      if (Math.abs(z) < 8 && x > -halfSize * 0.4 && x < halfSize * 0.4) continue;
      
      const types: ('oak' | 'pine' | 'birch' | 'dead')[] = ['oak', 'oak', 'pine', 'pine', 'pine', 'birch', 'dead'];
      const type = types[Math.floor(Math.random() * types.length)];
      const scale = 0.7 + Math.random() * 0.6;
      
      treeList.push({
        position: [x, 0, z],
        type,
        scale
      });
    }
    
    return treeList;
  }, [worldSize]);

  // Only render trees within view distance
  const visibleTrees = useMemo(() => {
    const playerX = playerPosition.x - worldSize / 2;
    const playerZ = playerPosition.y - worldSize / 2;
    const viewDistance = 60;

    return trees.filter(tree => {
      const dx = tree.position[0] - playerX;
      const dz = tree.position[2] - playerZ;
      return dx * dx + dz * dz < viewDistance * viewDistance;
    });
  }, [trees, playerPosition, worldSize]);

  return (
    <>
      {visibleTrees.map((tree, i) => (
        <RealisticTree
          key={i}
          position={tree.position}
          type={tree.type}
          scale={tree.scale}
        />
      ))}
    </>
  );
};

// Keyboard controls for actions
const ActionControls = ({
  gameState,
  onCollectResource,
  onAttackEnemy,
  setIsAttacking,
}: {
  gameState: GameState;
  onCollectResource: (id: string) => void;
  onAttackEnemy: (id: string, damage: number) => void;
  setIsAttacking: (v: boolean) => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsAttacking(true);
        setTimeout(() => setIsAttacking(false), 300);
        
        // Attack nearest enemy
        const attackRange = 50;
        gameState.enemies.forEach(enemy => {
          const dist = Math.sqrt(
            Math.pow(enemy.position.x - gameState.player.position.x, 2) +
            Math.pow(enemy.position.y - gameState.player.position.y, 2)
          );
          if (dist < attackRange) {
            const hasWeapon = gameState.player.inventory.some(i => i.type === 'axe' || i.type === 'spear');
            const damage = hasWeapon ? 30 : 10;
            onAttackEnemy(enemy.id, damage);
          }
        });
      }

      if (e.code === 'KeyE') {
        // Collect nearest resource
        const collectRange = 40;
        gameState.resources.forEach(resource => {
          const dist = Math.sqrt(
            Math.pow(resource.position.x - gameState.player.position.x, 2) +
            Math.pow(resource.position.y - gameState.player.position.y, 2)
          );
          if (dist < collectRange) {
            onCollectResource(resource.id);
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, onCollectResource, onAttackEnemy, setIsAttacking]);

  return null;
};

// Loading fallback
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#333" wireframe />
  </mesh>
);

export const GameWorld3D = ({ gameState, worldSize, onCollectResource, onAttackEnemy }: GameWorld3DProps) => {
  const { player, resources, buildings, enemies, isNight, timeOfDay } = gameState;
  const [isAttacking, setIsAttacking] = useState(false);

  const handleMove = useCallback((dx: number, dy: number) => {
    // Movement is handled by parent component through keyboard events
  }, []);

  return (
    <div className="w-[900px] h-[600px] rounded-lg overflow-hidden border-2 border-border shadow-2xl relative">
      {/* Instructions overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white px-4 py-2 rounded-lg text-sm pointer-events-none">
        انقر للتحكم | WASD للحركة | Space للهجوم | E للجمع | ESC للخروج
      </div>

      <Canvas 
        shadows 
        camera={{ fov: 75, near: 0.1, far: 200 }}
        onPointerDown={(e) => {
          (e.target as HTMLCanvasElement).requestPointerLock();
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* First Person Camera */}
          <FirstPersonCamera 
            playerPosition={player.position} 
            worldSize={worldSize}
            sanity={player.stats.sanity}
            onMove={handleMove}
          />

          {/* Crosshair */}
          <Crosshair />

          {/* First Person Weapon */}
          <WeaponView inventory={player.inventory} isAttacking={isAttacking} />

          {/* Fog */}
          <fog attach="fog" args={[isNight ? '#050a05' : '#1a3a2a', 5, isNight ? 40 : 70]} />

          {/* Lighting */}
          <DynamicLighting timeOfDay={timeOfDay} isNight={isNight} />
          
          {/* Ambient light for first person */}
          <ambientLight intensity={isNight ? 0.1 : 0.4} />

          {/* Sky */}
          {isNight ? (
            <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
          ) : (
            <mesh>
              <sphereGeometry args={[100, 32, 32]} />
              <meshBasicMaterial color={`hsl(200, 60%, ${30 + (1 - Math.abs(timeOfDay - 12) / 12) * 40}%)`} side={1} />
            </mesh>
          )}

          {/* Ground */}
          <EnhancedGround size={worldSize} />

          {/* River */}
          <River worldSize={worldSize} />

          {/* Vegetation */}
          <Vegetation worldSize={worldSize} playerPosition={player.position} />

          {/* Forest */}
          <RealisticForest worldSize={worldSize} playerPosition={player.position} />

          {/* Buildings */}
          {buildings.map(building => (
            <Building3D key={building.id} building={building} worldSize={worldSize} />
          ))}

          {/* Resources */}
          {resources.map(resource => (
            <Resource3D key={resource.id} resource={resource} worldSize={worldSize} />
          ))}

          {/* Enemies */}
          {enemies.map(enemy => (
            <Enemy3D key={enemy.id} enemy={enemy} worldSize={worldSize} />
          ))}

          {/* Player flashlight */}
          <pointLight
            position={[
              player.position.x - worldSize / 2,
              1.7,
              player.position.y - worldSize / 2
            ]}
            intensity={isNight ? 2 : 0.5}
            distance={isNight ? 15 : 8}
            color="#ffaa55"
            castShadow
          />

          {/* Action controls */}
          <ActionControls
            gameState={gameState}
            onCollectResource={onCollectResource}
            onAttackEnemy={onAttackEnemy}
            setIsAttacking={setIsAttacking}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
