import { Button } from '@/components/ui/button';
import { GameEnding } from '@/types/game';

interface EndingScreenProps {
  ending: GameEnding;
  daysSurvived: number;
  enemiesKilled: number;
  onRestart: () => void;
}

const ENDING_CONTENT: Record<NonNullable<GameEnding>, {
  title: string;
  description: string[];
  icon: string;
  color: string;
}> = {
  stay_fight: {
    title: 'البطل المحارب',
    description: [
      'قررت البقاء والقتال...',
      'بعد معارك طاحنة، قضيت على كل المخلوقات.',
      'الجزيرة الآن آمنة... لكنك وحيد إلى الأبد.',
      'هل كان الأمر يستحق؟',
    ],
    icon: '⚔️',
    color: 'text-danger',
  },
  plane_death: {
    title: 'رحلة الموت',
    description: [
      'بنيت طائرة من الحطام...',
      'أقلعت نحو السماء بأمل...',
      'لكن الطائرة لم تكن مستقرة.',
      'سقطت في البحر... ولم ينجُ أحد.',
      'أحياناً، الأمل يكون أكبر فخ.',
    ],
    icon: '✈️💀',
    color: 'text-destructive',
  },
  boat_escape: {
    title: 'الحرية',
    description: [
      'القارب جاهز...',
      'أبحرت بعيداً عن الجزيرة الملعونة.',
      'بعد أيام، وصلت إلى شاطئ آخر.',
      'نجوت... لكن الكوابيس لن تنتهي أبداً.',
      'الجزيرة ستبقى في ذاكرتك.',
    ],
    icon: '⛵🌅',
    color: 'text-safe',
  },
  radio_rescue: {
    title: 'الإنقاذ',
    description: [
      'الراديو يعمل!',
      '"ماي داي... ماي داي..."',
      'بعد ساعات طويلة، وصلت طائرة إنقاذ.',
      'أخبرتهم بكل شيء... لكن لم يصدقوك أحد.',
      'الجزيرة؟ اختفت من الخرائط.',
      'كأنها لم تكن موجودة أبداً...',
    ],
    icon: '📻🚁',
    color: 'text-primary',
  },
};

export const EndingScreen = ({ ending, daysSurvived, enemiesKilled, onRestart }: EndingScreenProps) => {
  if (!ending) return null;

  const content = ENDING_CONTENT[ending];

  return (
    <div className="min-h-screen game-container flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 fog-overlay" />
      
      <div className="relative z-10 text-center space-y-8 max-w-lg mx-auto px-4">
        {/* Icon */}
        <div className="text-8xl animate-pulse">
          {content.icon}
        </div>

        {/* Title */}
        <h1 className={`text-5xl md:text-7xl font-creepy ${content.color}`}>
          {content.title}
        </h1>

        {/* Story */}
        <div className="space-y-3 text-lg">
          {content.description.map((line, i) => (
            <p 
              key={i} 
              className="text-foreground/90"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 text-muted-foreground">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{daysSurvived}</div>
            <div className="text-sm">أيام النجاة</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{enemiesKilled}</div>
            <div className="text-sm">أعداء مقتولين</div>
          </div>
        </div>

        {/* Restart button */}
        <Button
          onClick={onRestart}
          size="lg"
          className="px-12 py-6 text-xl font-bold bg-primary hover:bg-primary/80 text-primary-foreground"
        >
          العب مرة أخرى
        </Button>

        {/* Ending type */}
        <p className="text-xs text-muted-foreground">
          نهاية: {content.title} ({ending})
        </p>
      </div>
    </div>
  );
};
