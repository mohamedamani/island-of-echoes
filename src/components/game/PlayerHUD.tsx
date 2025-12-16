import { useState } from 'react';
import { PlayerStats } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';

interface PlayerHUDProps {
  stats: PlayerStats;
  timeOfDay: number;
  dayCount: number;
  isNight: boolean;
  onSaveGame: () => boolean;
}

export const PlayerHUD = ({ stats, timeOfDay, dayCount, isNight, onSaveGame }: PlayerHUDProps) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatColor = (value: number, type: 'health' | 'hunger' | 'thirst' | 'sanity') => {
    if (value <= 20) return 'bg-danger';
    if (value <= 50) return type === 'sanity' ? 'bg-sanity' : `bg-${type}`;
    return type === 'health' ? 'bg-health' : type === 'hunger' ? 'bg-hunger' : type === 'thirst' ? 'bg-thirst' : 'bg-sanity';
  };

  const handleSave = () => {
    setSaveStatus('saving');
    const success = onSaveGame();
    if (success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('idle');
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
      {/* Stats */}
      <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 space-y-3 min-w-[200px] pointer-events-auto">
        {/* Health */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">❤️ الصحة</span>
            <span className={stats.health <= 20 ? 'text-danger pulse-danger' : ''}>{Math.round(stats.health)}%</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`h-full transition-all duration-300 ${getStatColor(stats.health, 'health')}`}
              style={{ width: `${stats.health}%` }}
            />
          </div>
        </div>

        {/* Hunger */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">🍖 الجوع</span>
            <span className={stats.hunger <= 20 ? 'text-danger pulse-danger' : ''}>{Math.round(stats.hunger)}%</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`h-full transition-all duration-300 ${getStatColor(stats.hunger, 'hunger')}`}
              style={{ width: `${stats.hunger}%` }}
            />
          </div>
        </div>

        {/* Thirst */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">💧 العطش</span>
            <span className={stats.thirst <= 20 ? 'text-danger pulse-danger' : ''}>{Math.round(stats.thirst)}%</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`h-full transition-all duration-300 ${getStatColor(stats.thirst, 'thirst')}`}
              style={{ width: `${stats.thirst}%` }}
            />
          </div>
        </div>

        {/* Sanity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">🧠 العقل</span>
            <span className={stats.sanity <= 30 ? 'text-sanity pulse-danger' : ''}>{Math.round(stats.sanity)}%</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`h-full transition-all duration-300 ${getStatColor(stats.sanity, 'sanity')}`}
              style={{ width: `${stats.sanity}%` }}
            />
          </div>
        </div>
      </div>

      {/* Time & Day & Save */}
      <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 text-center pointer-events-auto space-y-3">
        <div>
          <div className="text-2xl mb-1">
            {isNight ? '🌙' : '☀️'}
          </div>
          <div className="text-lg font-bold">
            {formatTime(timeOfDay)}
          </div>
          <div className="text-xs text-muted-foreground">
            اليوم {dayCount}
          </div>
          {isNight && (
            <div className="text-xs text-danger mt-1 pulse-danger">
              ⚠️ خطر!
            </div>
          )}
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          size="sm"
          variant="outline"
          disabled={saveStatus === 'saving'}
          className="w-full text-xs gap-1"
        >
          {saveStatus === 'saved' ? (
            <>
              <Check className="w-3 h-3" />
              تم الحفظ
            </>
          ) : saveStatus === 'saving' ? (
            <>
              <Save className="w-3 h-3 animate-pulse" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-3 h-3" />
              حفظ اللعبة
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
