'use client';
import { Link } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components';
import { acknowledgeCookieConsent } from '@/lib/actions/cookieConsent';
import { COOKIE_POLICY } from '@/lib/routes';

interface Props {
  initialAcknowledged: boolean;
}

export const CookieConsentBanner = ({ initialAcknowledged }: Props) => {
  const t = useTranslations('CookieConsent');
  const [isAcknowledged, setIsAcknowledged] = useState(initialAcknowledged);

  if (isAcknowledged) {
    return null;
  }

  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    acknowledgeCookieConsent().catch((error) => {
      console.error('[CookieConsentBanner] failed to persist cookie consent:', error);
    });
  };

  return (
    <div className="bg-background border-divider fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 border-t p-4 shadow-lg sm:flex-row sm:justify-between">
      <p className="text-sm">
        {t('message')} <Link href={COOKIE_POLICY}>{t('learnMore')}</Link>
      </p>
      <Button size="sm" onPress={handleAcknowledge}>
        {t('acknowledge')}
      </Button>
    </div>
  );
};
