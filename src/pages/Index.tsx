import { Game } from '@/components/game/Game';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>الغابة - The Forest | لعبة سرفايفل</title>
        <meta name="description" content="لعبة سرفايفل مستوحاة من The Forest. ابقَ حياً في جزيرة مليئة بالخطر، اجمع الموارد، اصنع الأدوات، وابحث عن طريقة للنجاة." />
      </Helmet>
      <Game />
    </>
  );
};

export default Index;
