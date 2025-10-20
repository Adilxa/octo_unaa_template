import { useTranslations } from 'next-intl';
import Container from '@/components/ui/container';

export default function ExampleScreen() {
  const t = useTranslations('ExampleScreen');
  return (
    <Container>
      <h1>{t('title')}</h1>
      <h4>{t('description')}</h4>
    </Container>
  );
}
