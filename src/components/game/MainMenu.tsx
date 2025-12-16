import { Button } from '@/components/ui/button';

interface MainMenuProps {
  onStartGame: () => void;
  onLoadGame: () => void;
  hasSavedGame: boolean;
  savedGameInfo: { dayCount: number; savedAt: Date } | null;
  onDeleteSave: () => void;
}

export const MainMenu = ({ onStartGame, onLoadGame, hasSavedGame, savedGameInfo, onDeleteSave }: MainMenuProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="min-h-screen game-container flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated fog layers */}
      <div className="absolute inset-0 fog-overlay animate-pulse" />
      
      {/* Forest silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-30">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-background via-transparent to-transparent" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 bg-primary/20"
            style={{
              left: `${i * 5}%`,
              width: '40px',
              height: `${60 + Math.random() * 100}px`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              transform: `translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-7xl md:text-9xl font-creepy text-primary tracking-wider animate-pulse">
            الغابة
          </h1>
          <p className="text-2xl md:text-3xl font-creepy text-danger tracking-widest">
            THE FOREST
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
          استيقظت وحيداً في جزيرة مجهولة...
          <br />
          ابنك اختُطف... والخطر في كل مكان
          <br />
          <span className="text-danger">ابقَ حياً. اكتشف الحقيقة.</span>
        </p>

        {/* Stats preview */}
        <div className="flex justify-center gap-6 text-sm opacity-70">
          <span>❤️ الصحة</span>
          <span>🍖 الجوع</span>
          <span>💧 العطش</span>
          <span>🧠 العقل</span>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Continue button (if save exists) */}
          {hasSavedGame && savedGameInfo && (
            <div className="space-y-2">
              <Button
                onClick={onLoadGame}
                size="lg"
                className="px-12 py-6 text-xl font-bold bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 w-full max-w-xs"
              >
                استكمال اللعبة
              </Button>
              <div className="text-sm text-muted-foreground">
                📅 اليوم {savedGameInfo.dayCount} | آخر حفظ: {formatDate(savedGameInfo.savedAt)}
              </div>
            </div>
          )}

          {/* New game button */}
          <Button
            onClick={() => {
              if (hasSavedGame) {
                onDeleteSave();
              }
              onStartGame();
            }}
            size="lg"
            variant={hasSavedGame ? "outline" : "default"}
            className={`px-12 py-6 text-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 w-full max-w-xs ${
              !hasSavedGame 
                ? 'bg-primary hover:bg-primary/80 text-primary-foreground hover:shadow-primary/30' 
                : 'border-primary/50 hover:bg-primary/20'
            }`}
          >
            {hasSavedGame ? 'لعبة جديدة' : 'ابدأ النجاة'}
          </Button>
        </div>

        {/* Endings hint */}
        <div className="mt-12 text-muted-foreground text-sm space-y-1">
          <p>🎯 4 نهايات مختلفة</p>
          <div className="flex justify-center gap-4 text-xs opacity-60">
            <span>⚔️ البقاء والقتال</span>
            <span>✈️ الطائرة</span>
            <span>⛵ القارب</span>
            <span>📻 الراديو</span>
          </div>
        </div>
      </div>

      {/* Controls info */}
      <div className="absolute bottom-8 text-muted-foreground text-sm">
        <p>WASD أو الأسهم للتحرك | مسافة للهجوم | E للجمع</p>
      </div>
    </div>
  );
};
