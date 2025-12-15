import { useState, useCallback, useEffect } from 'react';
import { GameState, Position, Resource, Enemy, Building, InventoryItem, GameEnding } from '@/types/game';

const WORLD_SIZE = 800;
const INITIAL_RESOURCES = 30;
const INITIAL_ENEMIES = 5;

const generateResources = (): Resource[] => {
  const resources: Resource[] = [];
  const types: Resource['type'][] = ['wood', 'stone', 'food', 'water', 'cloth', 'metal'];
  
  for (let i = 0; i < INITIAL_RESOURCES; i++) {
    resources.push({
      id: `resource-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      position: {
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
      },
      amount: Math.floor(Math.random() * 3) + 1,
    });
  }
  return resources;
};

const generateEnemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  for (let i = 0; i < INITIAL_ENEMIES; i++) {
    enemies.push({
      id: `enemy-${i}`,
      type: Math.random() > 0.7 ? 'mutant' : 'cannibal',
      position: {
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
      },
      health: 100,
      state: 'patrol',
      targetPosition: {
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
      },
    });
  }
  return enemies;
};

const initialState: GameState = {
  player: {
    position: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 },
    stats: { health: 100, hunger: 100, thirst: 100, sanity: 100 },
    inventory: [],
  },
  resources: [],
  buildings: [],
  enemies: [],
  timeOfDay: 8,
  dayCount: 1,
  isNight: false,
  gamePhase: 'menu',
  ending: null,
  endingProgress: {
    planePartsCollected: 0,
    boatPartsCollected: 0,
    radioFixed: false,
    enemiesKilled: 0,
  },
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const startGame = useCallback(() => {
    setGameState({
      ...initialState,
      resources: generateResources(),
      enemies: generateEnemies(),
      gamePhase: 'playing',
    });
  }, []);

  const movePlayer = useCallback((direction: { x: number; y: number }) => {
    setGameState(prev => {
      if (prev.gamePhase !== 'playing') return prev;
      
      const speed = 5;
      const newX = Math.max(20, Math.min(WORLD_SIZE - 20, prev.player.position.x + direction.x * speed));
      const newY = Math.max(20, Math.min(WORLD_SIZE - 20, prev.player.position.y + direction.y * speed));
      
      return {
        ...prev,
        player: {
          ...prev.player,
          position: { x: newX, y: newY },
        },
      };
    });
  }, []);

  const collectResource = useCallback((resourceId: string) => {
    setGameState(prev => {
      const resource = prev.resources.find(r => r.id === resourceId);
      if (!resource) return prev;

      const existingItem = prev.player.inventory.find(i => i.type === resource.type);
      const newInventory = existingItem
        ? prev.player.inventory.map(i =>
            i.type === resource.type ? { ...i, amount: i.amount + resource.amount } : i
          )
        : [...prev.player.inventory, { type: resource.type, amount: resource.amount, icon: getResourceIcon(resource.type) }];

      return {
        ...prev,
        resources: prev.resources.filter(r => r.id !== resourceId),
        player: {
          ...prev.player,
          inventory: newInventory,
        },
      };
    });
  }, []);

  const craftItem = useCallback((itemId: string, requirements: { type: string; amount: number }[]) => {
    setGameState(prev => {
      // Check if player has enough resources
      const hasResources = requirements.every(req => {
        const item = prev.player.inventory.find(i => i.type === req.type);
        return item && item.amount >= req.amount;
      });

      if (!hasResources) return prev;

      // Remove resources
      let newInventory = prev.player.inventory.map(item => {
        const req = requirements.find(r => r.type === item.type);
        if (req) {
          return { ...item, amount: item.amount - req.amount };
        }
        return item;
      }).filter(item => item.amount > 0);

      // Add crafted item
      const existingCrafted = newInventory.find(i => i.type === itemId);
      if (existingCrafted) {
        newInventory = newInventory.map(i =>
          i.type === itemId ? { ...i, amount: i.amount + 1 } : i
        );
      } else {
        newInventory.push({ type: itemId, amount: 1, icon: getCraftedIcon(itemId) });
      }

      // Update ending progress
      let endingProgress = { ...prev.endingProgress };
      if (itemId === 'plane_part') endingProgress.planePartsCollected++;
      if (itemId === 'boat_part') endingProgress.boatPartsCollected++;
      if (itemId === 'radio') endingProgress.radioFixed = true;

      return {
        ...prev,
        player: { ...prev.player, inventory: newInventory },
        endingProgress,
      };
    });
  }, []);

  const placeBuilding = useCallback((type: Building['type']) => {
    setGameState(prev => {
      const newBuilding: Building = {
        id: `building-${Date.now()}`,
        type,
        position: { ...prev.player.position },
        health: 100,
      };

      return {
        ...prev,
        buildings: [...prev.buildings, newBuilding],
      };
    });
  }, []);

  const attackEnemy = useCallback((enemyId: string, damage: number) => {
    setGameState(prev => {
      const enemy = prev.enemies.find(e => e.id === enemyId);
      if (!enemy) return prev;

      const newHealth = enemy.health - damage;
      
      if (newHealth <= 0) {
        return {
          ...prev,
          enemies: prev.enemies.filter(e => e.id !== enemyId),
          endingProgress: {
            ...prev.endingProgress,
            enemiesKilled: prev.endingProgress.enemiesKilled + 1,
          },
          player: {
            ...prev.player,
            stats: {
              ...prev.player.stats,
              sanity: Math.max(0, prev.player.stats.sanity - 5),
            },
          },
        };
      }

      return {
        ...prev,
        enemies: prev.enemies.map(e =>
          e.id === enemyId ? { ...e, health: newHealth, state: 'chase' as const } : e
        ),
      };
    });
  }, []);

  const triggerEnding = useCallback((ending: GameEnding) => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'ending',
      ending,
    }));
  }, []);

  // Game tick - updates stats and AI
  useEffect(() => {
    if (gameState.gamePhase !== 'playing') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        // Update time
        let newTime = prev.timeOfDay + 0.05;
        let newDay = prev.dayCount;
        if (newTime >= 24) {
          newTime = 0;
          newDay++;
        }
        const isNight = newTime >= 20 || newTime < 6;

        // Update player stats
        const hungerRate = 0.1;
        const thirstRate = 0.15;
        const sanityRate = isNight ? 0.1 : -0.05;

        const newStats = {
          health: prev.player.stats.hunger <= 0 || prev.player.stats.thirst <= 0
            ? Math.max(0, prev.player.stats.health - 0.5)
            : prev.player.stats.health,
          hunger: Math.max(0, prev.player.stats.hunger - hungerRate),
          thirst: Math.max(0, prev.player.stats.thirst - thirstRate),
          sanity: Math.max(0, Math.min(100, prev.player.stats.sanity - sanityRate)),
        };

        // Update enemies AI
        const newEnemies = prev.enemies.map(enemy => {
          const distToPlayer = Math.sqrt(
            Math.pow(enemy.position.x - prev.player.position.x, 2) +
            Math.pow(enemy.position.y - prev.player.position.y, 2)
          );

          // AI behavior based on distance and time
          let newState = enemy.state;
          let newTarget = enemy.targetPosition;

          if (distToPlayer < 150 && isNight) {
            newState = 'chase';
            newTarget = prev.player.position;
          } else if (distToPlayer < 100) {
            newState = Math.random() > 0.3 ? 'chase' : 'watch';
            if (newState === 'chase') newTarget = prev.player.position;
          } else if (distToPlayer < 200) {
            newState = 'watch';
          } else {
            newState = 'patrol';
            if (!newTarget || Math.random() < 0.01) {
              newTarget = {
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
              };
            }
          }

          // Move enemy
          let newPos = { ...enemy.position };
          if (newTarget && (newState === 'chase' || newState === 'patrol')) {
            const speed = newState === 'chase' ? 2 : 0.5;
            const dx = newTarget.x - enemy.position.x;
            const dy = newTarget.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              newPos.x += (dx / dist) * speed;
              newPos.y += (dy / dist) * speed;
            }
          }

          return {
            ...enemy,
            position: newPos,
            state: newState,
            targetPosition: newTarget,
          };
        });

        // Check for enemy attacks
        let damageFromEnemies = 0;
        newEnemies.forEach(enemy => {
          const dist = Math.sqrt(
            Math.pow(enemy.position.x - prev.player.position.x, 2) +
            Math.pow(enemy.position.y - prev.player.position.y, 2)
          );
          if (dist < 30 && enemy.state === 'chase') {
            damageFromEnemies += enemy.type === 'mutant' ? 2 : 1;
          }
        });

        if (damageFromEnemies > 0) {
          newStats.health = Math.max(0, newStats.health - damageFromEnemies);
        }

        // Spawn new resources occasionally
        let newResources = [...prev.resources];
        if (Math.random() < 0.01 && prev.resources.length < 40) {
          const types: Resource['type'][] = ['wood', 'stone', 'food', 'water', 'cloth', 'metal'];
          newResources.push({
            id: `resource-${Date.now()}`,
            type: types[Math.floor(Math.random() * types.length)],
            position: {
              x: Math.random() * WORLD_SIZE,
              y: Math.random() * WORLD_SIZE,
            },
            amount: Math.floor(Math.random() * 3) + 1,
          });
        }

        // Spawn new enemies at night
        if (isNight && Math.random() < 0.005 && prev.enemies.length < 15) {
          newEnemies.push({
            id: `enemy-${Date.now()}`,
            type: Math.random() > 0.7 ? 'mutant' : 'cannibal',
            position: {
              x: Math.random() * WORLD_SIZE,
              y: Math.random() * WORLD_SIZE,
            },
            health: 100,
            state: 'patrol',
            targetPosition: {
              x: Math.random() * WORLD_SIZE,
              y: Math.random() * WORLD_SIZE,
            },
          });
        }

        return {
          ...prev,
          timeOfDay: newTime,
          dayCount: newDay,
          isNight,
          resources: newResources,
          enemies: newEnemies,
          player: {
            ...prev.player,
            stats: newStats,
          },
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.gamePhase]);

  // Check for game over
  useEffect(() => {
    if (gameState.player.stats.health <= 0 && gameState.gamePhase === 'playing') {
      triggerEnding('plane_death');
    }
  }, [gameState.player.stats.health, gameState.gamePhase, triggerEnding]);

  return {
    gameState,
    startGame,
    movePlayer,
    collectResource,
    craftItem,
    placeBuilding,
    attackEnemy,
    triggerEnding,
    WORLD_SIZE,
  };
};

const getResourceIcon = (type: string): string => {
  const icons: Record<string, string> = {
    wood: '🪵',
    stone: '🪨',
    food: '🍖',
    water: '💧',
    cloth: '🧵',
    metal: '⚙️',
  };
  return icons[type] || '📦';
};

const getCraftedIcon = (type: string): string => {
  const icons: Record<string, string> = {
    axe: '🪓',
    spear: '🔱',
    shelter: '🏠',
    fire: '🔥',
    trap: '🪤',
    plane_part: '✈️',
    boat_part: '⛵',
    radio: '📻',
    armor: '🛡️',
  };
  return icons[type] || '🔧';
};
