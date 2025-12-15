import { useEffect, useCallback, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { MainMenu } from './MainMenu';
import { GameWorld } from './GameWorld';
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
    movePlayer,
    collectResource,
    craftItem,
    placeBuilding,
    attackEnemy,
    triggerEnding,
    WORLD_SIZE,
  } = useGameState();

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

  // Movement loop
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
      }
    }, 16);

    return () => clearInterval(interval);
  }, [keys, gameState.gamePhase, movePlayer]);

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
  }, [gameState.player.inventory, toast]);

  // Handle crafting with feedback
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
    
    toast({ 
      title: '🔧 تم الصنع!', 
      description: `صنعت ${itemNames[itemId] || itemId}` 
    });

    // Auto-place buildings
    if (['shelter', 'fire', 'trap'].includes(itemId)) {
      placeBuilding(itemId as any);
      toast({ 
        title: '🏗️ تم البناء!', 
        description: `وُضع ${itemNames[itemId]} في موقعك` 
      });
    }
  }, [craftItem, placeBuilding, toast]);

  // Render based on game phase
  if (gameState.gamePhase === 'menu') {
    return <MainMenu onStartGame={startGame} />;
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
        <GameWorld
          gameState={gameState}
          worldSize={WORLD_SIZE}
          onCollectResource={collectResource}
          onAttackEnemy={attackEnemy}
        />

        <PlayerHUD
          stats={gameState.player.stats}
          timeOfDay={gameState.timeOfDay}
          dayCount={gameState.dayCount}
          isNight={gameState.isNight}
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
