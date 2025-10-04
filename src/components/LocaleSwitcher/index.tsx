import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcherDropdown from './LocaleSwitcherDropdown';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export const LocaleSwitcher = ({ type = 'dropdown' }: { type?: 'dropdown' | 'select' }) => {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const Child = type === 'dropdown' ? LocaleSwitcherDropdown : LocaleSwitcherSelect;

  return (
    <Child
      defaultValue={locale}
      items={[
        {
          value: 'en',
          label: t('en'),
          code: 'UK',
        },
        {
          value: 'es',
          label: t('es'),
          code: 'ES',
        },
        {
          value: 'es-AR',
          label: t('es-AR'),
          code: 'AR',
        },
      ]}
      label={t('label')}
    />
  );
};
