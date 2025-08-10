import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export const LocaleSwitcher = () => {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: 'en',
          label: t('en'),
        },
        {
          value: 'es',
          label: t('es'),
        },
        {
          value: 'es-AR',
          label: t('es-AR'),
        },
      ]}
      label={t('label')}
    />
  );
};
