import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GameState } from '@/types/game';
import { Ground } from './3d/Ground';
import { Forest } from './3d/Forest';
import { Player3D } from './3d/Player3D';
import { Enemy3D } from './3d/Enemy3D';
import { Resource3D } from './3d/Resource3D';
import { Building3D } from './3d/Building3D';
import { DynamicLighting } from './3d/DynamicLighting';
import { Atmosphere } from './3d/Atmosphere';
import { Vector3 } from 'three';

interface GameWorld3DProps {
  gameState: GameState;
  worldSize: number;
  onCollectResource: (id: string) => void;
  onAttackEnemy: (id: string, damage: number) => void;
}

// Camera that follows the player
const FollowCamera = ({ playerPosition, worldSize }: { playerPosition: { x: number; y: number }; worldSize: number }) => {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3());

  useFrame(() => {
    // Convert 2D position to 3D
    const targetX = playerPosition.x - worldSize / 2;
    const targetZ = playerPosition.y - worldSize / 2;
    
    targetRef.current.set(targetX, 15, targetZ + 15);
    
    // Smooth camera follow
    camera.position.lerp(targetRef.current, 0.05);
    camera.lookAt(targetX, 0, targetZ);
  });

  return null;
};

// Keyboard controls
const KeyboardControls = ({
  gameState,
  onCollectResource,
  onAttackEnemy,
}: {
  gameState: GameState;
  onCollectResource: (id: string) => void;
  onAttackEnemy: (id: string, damage: number) => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
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
  }, [gameState, onCollectResource, onAttackEnemy]);

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

  return (
    <div className="w-[800px] h-[600px] rounded-lg overflow-hidden border-2 border-border shadow-2xl">
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[0, 20, 20]} fov={60} />
          <FollowCamera playerPosition={player.position} worldSize={worldSize} />

          {/* Fog */}
          <fog attach="fog" args={[isNight ? '#0a1a0a' : '#1a3a2a', 20, 80]} />

          {/* Lighting */}
          <DynamicLighting timeOfDay={timeOfDay} isNight={isNight} />

          {/* Atmosphere */}
          <Atmosphere timeOfDay={timeOfDay} isNight={isNight} />

          {/* Ground */}
          <Ground size={worldSize} />

          {/* Forest */}
          <Forest worldSize={worldSize} playerPosition={player.position} />

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

          {/* Player */}
          <Player3D
            position={player.position}
            sanity={player.stats.sanity}
            worldSize={worldSize}
          />

          {/* Keyboard controls */}
          <KeyboardControls
            gameState={gameState}
            onCollectResource={onCollectResource}
            onAttackEnemy={onAttackEnemy}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
