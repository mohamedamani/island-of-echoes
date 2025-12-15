export interface Position {
  x: number;
  y: number;
}

export interface PlayerStats {
  health: number;
  hunger: number;
  thirst: number;
  sanity: number;
}

export interface Resource {
  id: string;
  type: 'wood' | 'stone' | 'food' | 'water' | 'cloth' | 'metal';
  position: Position;
  amount: number;
}

export interface InventoryItem {
  type: string;
  amount: number;
  icon: string;
}

export interface CraftableItem {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  requirements: { type: string; amount: number }[];
  category: 'tool' | 'weapon' | 'building' | 'special';
}

export interface Building {
  id: string;
  type: 'shelter' | 'wall' | 'trap' | 'fire' | 'radio' | 'plane' | 'boat';
  position: Position;
  health: number;
}

export interface Enemy {
  id: string;
  type: 'cannibal' | 'mutant';
  position: Position;
  health: number;
  state: 'patrol' | 'watch' | 'chase' | 'attack' | 'retreat';
  targetPosition?: Position;
  lastSeenPlayer?: Position;
}

export type GameEnding = 'stay_fight' | 'plane_death' | 'boat_escape' | 'radio_rescue' | null;

export interface GameState {
  player: {
    position: Position;
    stats: PlayerStats;
    inventory: InventoryItem[];
  };
  resources: Resource[];
  buildings: Building[];
  enemies: Enemy[];
  timeOfDay: number; // 0-24
  dayCount: number;
  isNight: boolean;
  gamePhase: 'menu' | 'playing' | 'paused' | 'ending';
  ending: GameEnding;
  endingProgress: {
    planePartsCollected: number;
    boatPartsCollected: number;
    radioFixed: boolean;
    enemiesKilled: number;
  };
}
