import { useEffect, useCallback, useState, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameAudio } from '@/hooks/useGameAudio';
import { MainMenu } from './MainMenu';
import { GameWorld3D } from './GameWorld3D';
import { PlayerHUD } from './PlayerHUD';
import { Inventory } from './Inventory';
import { EndingPanel } from './EndingPanel';
import { EndingScreen } from './EndingScreen';
import { useToast } from '@/hooks/use-toast';

export const Game = () => {
  const { toast } = useToast();
  const {
    gameState,
    startGame,
    loadGame,
    saveGame,
    hasSavedGame,
    getSavedGameInfo,
    deleteSavedGame,
    movePlayer,
    collectResource,
    craftItem,
    placeBuilding,
    attackEnemy,
    triggerEnding,
    WORLD_SIZE,
  } = useGameState();

  const {
    startAudio,
    stopAudio,
    updateAudioState,
    playSFX,
    toggleMute,
    setMasterVolume,
    isMuted,
    volume
  } = useGameAudio();

  const lastMoveTime = useRef(0);

  const [keys, setKeys] = useState<Set<string>>(new Set());

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.code));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Start audio when game starts
  useEffect(() => {
    if (gameState.gamePhase === 'playing') {
      startAudio();
    } else {
      stopAudio();
    }
  }, [gameState.gamePhase, startAudio, stopAudio]);

  // Update audio state based on game state
  useEffect(() => {
    if (gameState.gamePhase === 'playing') {
      updateAudioState({
        isNight: gameState.isNight,
        playerHealth: gameState.player.stats.health,
        sanity: gameState.player.stats.sanity,
        isUnderAttack: gameState.enemies.some(e => e.state === 'attack')
      });
    }
  }, [gameState.isNight, gameState.player.stats.health, gameState.player.stats.sanity, gameState.enemies, gameState.gamePhase, updateAudioState]);

  // Play enemy sounds
  useEffect(() => {
    if (gameState.gamePhase !== 'playing') return;
    
    const attackingEnemies = gameState.enemies.filter(e => e.state === 'attack' || e.state === 'chase');
    if (attackingEnemies.length > 0 && Math.random() < 0.02) {
      playSFX('enemy_growl');
    }
  }, [gameState.enemies, gameState.gamePhase, playSFX]);

  // Movement loop with footstep sounds
  useEffect(() => {
    if (gameState.gamePhase !== 'playing') return;

    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;

      if (keys.has('KeyW') || keys.has('ArrowUp')) dy = -1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) dy = 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) dx = -1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) dx = 1;

      if (dx !== 0 || dy !== 0) {
        movePlayer({ x: dx, y: dy });
        
        // Play footstep sound occasionally
        const now = Date.now();
        if (now - lastMoveTime.current > 300) {
          playSFX('footstep');
          lastMoveTime.current = now;
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [keys, gameState.gamePhase, movePlayer, playSFX]);

  // Handle using items (food/water)
  const handleUseItem = useCallback((type: string) => {
    const item = gameState.player.inventory.find(i => i.type === type);
    if (!item || item.amount <= 0) return;

    // Remove item from inventory
    const newInventory = gameState.player.inventory.map(i =>
      i.type === type ? { ...i, amount: i.amount - 1 } : i
    ).filter(i => i.amount > 0);

    // This would need to be handled properly in the game state
    // For now, show a toast
    if (type === 'food') {
      toast({ title: '🍖 أكلت طعاماً', description: 'الجوع +30' });
    } else if (type === 'water') {
      toast({ title: '💧 شربت ماءً', description: 'العطش +30' });
    }
  }, [gameState.player.inventory, toast, playSFX]);

  // Handle crafting with feedback and sound
  const handleCraft = useCallback((itemId: string, requirements: { type: string; amount: number }[]) => {
    craftItem(itemId, requirements);
    
    const itemNames: Record<string, string> = {
      axe: 'فأس',
      spear: 'رمح',
      shelter: 'مأوى',
      fire: 'نار',
      trap: 'فخ',
      armor: 'درع',
      plane_part: 'جزء طائرة',
      boat_part: 'جزء قارب',
      radio: 'راديو',
    };
    
    playSFX('craft');
    toast({ 
      title: '🔧 تم الصنع!', 
      description: `صنعت ${itemNames[itemId] || itemId}` 
    });

    // Auto-place buildings
    if (['shelter', 'fire', 'trap'].includes(itemId)) {
      placeBuilding(itemId as any);
      playSFX('build');
      toast({ 
        title: '🏗️ تم البناء!', 
        description: `وُضع ${itemNames[itemId]} في موقعك` 
      });
    }
  }, [craftItem, placeBuilding, toast, playSFX]);

  // Handle collect with sound
  const handleCollect = useCallback((resourceId: string) => {
    collectResource(resourceId);
    playSFX('collect');
  }, [collectResource, playSFX]);

  // Handle attack with sound
  const handleAttack = useCallback((enemyId: string, damage: number) => {
    attackEnemy(enemyId, damage);
    playSFX('attack');
    
    // Play hit sound after small delay
    setTimeout(() => playSFX('hit'), 100);
  }, [attackEnemy, playSFX]);

  // Render based on game phase
  if (gameState.gamePhase === 'menu') {
    return (
      <MainMenu 
        onStartGame={startGame} 
        onLoadGame={loadGame}
        hasSavedGame={hasSavedGame()}
        savedGameInfo={getSavedGameInfo()}
        onDeleteSave={deleteSavedGame}
      />
    );
  }

  if (gameState.gamePhase === 'ending') {
    return (
      <EndingScreen
        ending={gameState.ending}
        daysSurvived={gameState.dayCount}
        enemiesKilled={gameState.endingProgress.enemiesKilled}
        onRestart={startGame}
      />
    );
  }

  // Blood vignette effect when low health
  const bloodOpacity = Math.max(0, (50 - gameState.player.stats.health) / 100);

  return (
    <div className="min-h-screen game-container flex items-center justify-center p-4 relative">
      {/* Blood vignette */}
      <div 
        className="absolute inset-0 blood-vignette pointer-events-none z-50"
        style={{ '--blood-opacity': bloodOpacity } as React.CSSProperties}
      />

      {/* Night overlay */}
      <div 
        className="absolute inset-0 night-overlay pointer-events-none z-40"
        style={{ '--night-opacity': gameState.isNight ? 0.4 : 0 } as React.CSSProperties}
      />

      {/* Main game area */}
      <div className="relative">
        <GameWorld3D
          gameState={gameState}
          worldSize={WORLD_SIZE}
          onCollectResource={handleCollect}
          onAttackEnemy={handleAttack}
        />

        <PlayerHUD
          stats={gameState.player.stats}
          timeOfDay={gameState.timeOfDay}
          dayCount={gameState.dayCount}
          isNight={gameState.isNight}
          onSaveGame={saveGame}
          isMuted={isMuted}
          volume={volume}
          onToggleMute={toggleMute}
          onVolumeChange={setMasterVolume}
        />

        <EndingPanel
          endingProgress={gameState.endingProgress}
          onTriggerEnding={triggerEnding}
        />

        <Inventory
          items={gameState.player.inventory}
          onCraft={handleCraft}
          onUseItem={handleUseItem}
        />
      </div>
    </div>
  );
};
