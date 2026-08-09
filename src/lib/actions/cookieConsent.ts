'use server';

import { cookies } from 'next/headers';

// Listed as a disclosed cookie in the Cookie Policy (messages/*.json -> LegalCookiePolicy) - keep
// that copy in sync if this name or its purpose changes.
const COOKIE_NAME = 'cookie_consent';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function hasAcknowledgedCookieConsent(): Promise<boolean> {
  return (await cookies()).has(COOKIE_NAME);
}

export async function acknowledgeCookieConsent(): Promise<void> {
  (await cookies()).set(COOKIE_NAME, new Date().toISOString(), { maxAge: ONE_YEAR_IN_SECONDS });
}
