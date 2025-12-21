import { Game } from '@/components/game/Game';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>الغابة - The Forest | لعبة سرفايفل ثلاثية الأبعاد</title>
        <meta name="title" content="الغابة - The Forest | لعبة سرفايفل ثلاثية الأبعاد" />
        <meta name="description" content="لعبة سرفايفل مستوحاة من The Forest. ابقَ حياً في جزيرة مليئة بالخطر، اجمع الموارد، اصنع الأدوات، وابحث عن طريقة للنجاة. 4 نهايات مختلفة تنتظرك!" />
        <meta name="keywords" content="لعبة, سرفايفل, survival, the forest, ألعاب, عربي, 3D, ثلاثية الأبعاد, مغامرة, رعب" />
        <meta name="author" content="الغابة - The Forest" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Arabic" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Viewport and Mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0d1f1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="الغابة" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://al-ghaba.lovable.app/" />
        <meta property="og:title" content="الغابة - The Forest | لعبة سرفايفل ثلاثية الأبعاد" />
        <meta property="og:description" content="لعبة سرفايفل مستوحاة من The Forest. ابقَ حياً في جزيرة مليئة بالخطر، اجمع الموارد، اصنع الأدوات، وابحث عن طريقة للنجاة." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:locale" content="ar_AR" />
        <meta property="og:site_name" content="الغابة - The Forest" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://al-ghaba.lovable.app/" />
        <meta property="twitter:title" content="الغابة - The Forest | لعبة سرفايفل ثلاثية الأبعاد" />
        <meta property="twitter:description" content="لعبة سرفايفل مستوحاة من The Forest. ابقَ حياً في جزيرة مليئة بالخطر!" />
        <meta property="twitter:image" content="/og-image.png" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://al-ghaba.lovable.app/" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": "الغابة - The Forest",
            "description": "لعبة سرفايفل مستوحاة من The Forest. ابقَ حياً في جزيرة مليئة بالخطر، اجمع الموارد، اصنع الأدوات، وابحث عن طريقة للنجاة.",
            "genre": ["Survival", "Horror", "Adventure"],
            "gamePlatform": "Web Browser",
            "applicationCategory": "Game",
            "operatingSystem": "Any",
            "inLanguage": "ar",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "الغابة - The Forest"
            }
          })}
        </script>
      </Helmet>
      <Game />
    </>
  );
};

export default Index;
