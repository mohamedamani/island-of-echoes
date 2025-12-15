import { InventoryItem, CraftableItem } from '@/types/game';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface InventoryProps {
  items: InventoryItem[];
  onCraft: (itemId: string, requirements: { type: string; amount: number }[]) => void;
  onUseItem: (type: string) => void;
}

const CRAFTABLE_ITEMS: CraftableItem[] = [
  { id: 'axe', name: 'Axe', nameAr: 'فأس', icon: '🪓', requirements: [{ type: 'wood', amount: 2 }, { type: 'stone', amount: 1 }], category: 'tool' },
  { id: 'spear', name: 'Spear', nameAr: 'رمح', icon: '🔱', requirements: [{ type: 'wood', amount: 3 }, { type: 'stone', amount: 1 }], category: 'weapon' },
  { id: 'shelter', name: 'Shelter', nameAr: 'مأوى', icon: '🏠', requirements: [{ type: 'wood', amount: 5 }, { type: 'cloth', amount: 2 }], category: 'building' },
  { id: 'fire', name: 'Fire', nameAr: 'نار', icon: '🔥', requirements: [{ type: 'wood', amount: 3 }], category: 'building' },
  { id: 'trap', name: 'Trap', nameAr: 'فخ', icon: '🪤', requirements: [{ type: 'wood', amount: 2 }, { type: 'metal', amount: 1 }], category: 'building' },
  { id: 'armor', name: 'Armor', nameAr: 'درع', icon: '🛡️', requirements: [{ type: 'cloth', amount: 3 }, { type: 'metal', amount: 2 }], category: 'tool' },
  { id: 'plane_part', name: 'Plane Part', nameAr: 'جزء طائرة', icon: '✈️', requirements: [{ type: 'metal', amount: 5 }, { type: 'cloth', amount: 2 }], category: 'special' },
  { id: 'boat_part', name: 'Boat Part', nameAr: 'جزء قارب', icon: '⛵', requirements: [{ type: 'wood', amount: 6 }, { type: 'cloth', amount: 3 }], category: 'special' },
  { id: 'radio', name: 'Radio', nameAr: 'راديو', icon: '📻', requirements: [{ type: 'metal', amount: 4 }, { type: 'stone', amount: 2 }], category: 'special' },
];

export const Inventory = ({ items, onCraft, onUseItem }: InventoryProps) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'craft'>('inventory');

  const canCraft = (item: CraftableItem) => {
    return item.requirements.every(req => {
      const inventoryItem = items.find(i => i.type === req.type);
      return inventoryItem && inventoryItem.amount >= req.amount;
    });
  };

  const getRequirementStatus = (req: { type: string; amount: number }) => {
    const inventoryItem = items.find(i => i.type === req.type);
    const has = inventoryItem?.amount || 0;
    return { has, needed: req.amount, satisfied: has >= req.amount };
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'inventory' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('inventory')}
        >
          🎒 المخزون
        </Button>
        <Button
          variant={activeTab === 'craft' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('craft')}
        >
          🔧 الصناعة
        </Button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="flex flex-wrap gap-2">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">المخزون فارغ - اضغط E لجمع الموارد</p>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="bg-muted rounded-lg p-3 flex flex-col items-center min-w-[60px] cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => {
                  if (item.type === 'food') onUseItem('food');
                  if (item.type === 'water') onUseItem('water');
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs mt-1">x{item.amount}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto">
          {CRAFTABLE_ITEMS.map(item => (
            <div
              key={item.id}
              className={`bg-muted rounded-lg p-3 ${canCraft(item) ? 'hover:bg-primary/20 cursor-pointer' : 'opacity-50'}`}
              onClick={() => canCraft(item) && onCraft(item.id, item.requirements)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.nameAr}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.requirements.map((req, i) => {
                  const status = getRequirementStatus(req);
                  return (
                    <span 
                      key={i} 
                      className={`text-xs px-1 rounded ${status.satisfied ? 'bg-safe/30 text-safe' : 'bg-danger/30 text-danger'}`}
                    >
                      {getResourceIcon(req.type)} {status.has}/{req.amount}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls hint */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        WASD: تحرك | Space: هجوم | E: جمع | انقر على طعام/ماء للاستهلاك
      </div>
    </div>
  );
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
