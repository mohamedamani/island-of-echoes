import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LOADING_TIPS = [
  'اجمع الموارد قبل حلول الليل...',
  'ابنِ مأوى للحماية من الأعداء...',
  'النار تبعد المخلوقات في الليل...',
  'حافظ على عقلك سليماً...',
  'استخدم الفخاخ للدفاع عن قاعدتك...',
  'هناك 4 طرق مختلفة للهروب...',
  'الراديو قد يكون طريقك للنجاة...',
  'القارب يحتاج للكثير من الموارد...',
];

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState(LOADING_TIPS[0]);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Rotate tips
    const tipInterval = setInterval(() => {
      setTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
    }, 2000);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(tipInterval);
          setFadeOut(true);
          setTimeout(onLoadingComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/10" />
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-creepy text-primary animate-pulse">
            الغابة
          </h1>
          <p className="text-xl md:text-2xl font-creepy text-danger/80 tracking-widest">
            THE FOREST
          </p>
        </div>

        {/* Loading bar container */}
        <div className="w-64 md:w-96 mx-auto space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-safe transition-all duration-300 ease-out rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            {Math.min(Math.round(progress), 100)}%
          </p>
        </div>

        {/* Loading tip */}
        <div className="h-12">
          <p className="text-foreground/70 text-sm md:text-base animate-fade-in">
            💡 {tip}
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent" />
    </div>
  );
};
