'use client';

import { mutate } from 'swr';
import { handleLogoutAction } from '@/lib/actions/auth';

// Logout redirects client-side (no full page reload), so the SWR cache would otherwise
// keep serving the previous user's data until each hook happens to revalidate.
export const clientLogout = async () => {
  await mutate(() => true, undefined, { revalidate: false });
  await handleLogoutAction();
};
