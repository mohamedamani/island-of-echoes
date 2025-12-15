import { Button } from '@/components/ui/button';
import { GameEnding } from '@/types/game';

interface EndingPanelProps {
  endingProgress: {
    planePartsCollected: number;
    boatPartsCollected: number;
    radioFixed: boolean;
    enemiesKilled: number;
  };
  onTriggerEnding: (ending: GameEnding) => void;
}

const ENDINGS = [
  {
    id: 'stay_fight' as GameEnding,
    name: 'البقاء والقتال',
    description: 'ابقَ في الجزيرة وقاتل حتى النهاية. اقضِ على كل الأعداء.',
    icon: '⚔️',
    requirement: 'اقتل 20 عدو',
    check: (progress: EndingPanelProps['endingProgress']) => progress.enemiesKilled >= 20,
  },
  {
    id: 'plane_death' as GameEnding,
    name: 'الطائرة',
    description: 'اصنع طائرة للهروب... لكن هل ستنجح؟',
    icon: '✈️',
    requirement: 'اجمع 3 أجزاء طائرة',
    check: (progress: EndingPanelProps['endingProgress']) => progress.planePartsCollected >= 3,
  },
  {
    id: 'boat_escape' as GameEnding,
    name: 'القارب',
    description: 'اصنع قارباً وأبحر نحو الحرية.',
    icon: '⛵',
    requirement: 'اجمع 3 أجزاء قارب',
    check: (progress: EndingPanelProps['endingProgress']) => progress.boatPartsCollected >= 3,
  },
  {
    id: 'radio_rescue' as GameEnding,
    name: 'الراديو',
    description: 'أصلح الراديو واطلب المساعدة.',
    icon: '📻',
    requirement: 'اصنع الراديو',
    check: (progress: EndingPanelProps['endingProgress']) => progress.radioFixed,
  },
];

export const EndingPanel = ({ endingProgress, onTriggerEnding }: EndingPanelProps) => {
  return (
    <div className="absolute top-20 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 w-64">
      <h3 className="text-lg font-creepy text-primary mb-3">🎯 النهايات</h3>
      
      <div className="space-y-3">
        {ENDINGS.map(ending => {
          const isAvailable = ending.check(endingProgress);
          return (
            <div 
              key={ending.id}
              className={`p-3 rounded-lg border ${isAvailable ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{ending.icon}</span>
                <span className={`font-medium ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`}>
                  {ending.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{ending.description}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${isAvailable ? 'text-safe' : 'text-muted-foreground'}`}>
                  {ending.requirement}
                </span>
                {isAvailable && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onTriggerEnding(ending.id)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    تفعيل
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress summary */}
      <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
        <div>⚔️ الأعداء المقتولين: {endingProgress.enemiesKilled}/20</div>
        <div>✈️ أجزاء الطائرة: {endingProgress.planePartsCollected}/3</div>
        <div>⛵ أجزاء القارب: {endingProgress.boatPartsCollected}/3</div>
        <div>📻 الراديو: {endingProgress.radioFixed ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};
