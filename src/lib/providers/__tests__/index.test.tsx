/**
 * @jest-environment node
 */
import { getAccounts } from '@/lib/actions/accounts';
import { getCategories } from '@/lib/actions/categories';
import { getSubcategories } from '@/lib/actions/subcategories';
import { auth } from '@/lib/auth';
import { AppProviders } from '@/lib/providers';
import { HOME } from '@/lib/routes';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/actions/accounts', () => ({ getAccounts: jest.fn() }));
jest.mock('@/lib/actions/categories', () => ({ getCategories: jest.fn() }));
jest.mock('@/lib/actions/subcategories', () => ({ getSubcategories: jest.fn() }));

const mockedRedirect = jest.fn((path: string) => {
  // next/navigation's real redirect() interrupts rendering by throwing a special digest
  // error that Next.js's router catches upstream - mimic "throws and stops execution" here.
  throw new Error(`NEXT_REDIRECT:${path}`);
});
jest.mock('next/navigation', () => ({
  redirect: (path: string) => mockedRedirect(path),
}));

const mockedAuth = auth as unknown as jest.Mock;
const mockedGetAccounts = getAccounts as unknown as jest.Mock;
const mockedGetCategories = getCategories as unknown as jest.Mock;
const mockedGetSubcategories = getSubcategories as unknown as jest.Mock;

describe('AppProviders', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children directly without fetching data when there is no session', async () => {
    mockedAuth.mockResolvedValue(null);

    await AppProviders({ children: null });

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedGetAccounts).not.toHaveBeenCalled();
  });

  // A session with `error` set (the jwt() callback in src/lib/auth/config.ts failed to refresh
  // the access token) still has a stale bearer token in session.user.token. Previously this fell
  // through to Promise.all, where backendFetch would throw deep inside a server action -
  // uncaught, surfacing as a crash instead of a clean sign-in redirect. Matches the pattern
  // NextAuth's own docs recommend: check session.error and force re-auth from the Server
  // Component, rather than letting the stale token reach a backend call.
  it('redirects to sign-in without fetching any data when the session has a refresh error', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'stale-token' }, error: 'RefreshAccessTokenError' });

    await expect(AppProviders({ children: null })).rejects.toThrow(`NEXT_REDIRECT:${HOME}`);

    expect(mockedRedirect).toHaveBeenCalledWith(HOME);
    expect(mockedGetAccounts).not.toHaveBeenCalled();
    expect(mockedGetCategories).not.toHaveBeenCalled();
    expect(mockedGetSubcategories).not.toHaveBeenCalled();
  });

  it('fetches data and does not redirect when the session is valid', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'valid-token' } });
    mockedGetCategories.mockResolvedValue([]);
    mockedGetSubcategories.mockResolvedValue([]);
    mockedGetAccounts.mockResolvedValue([]);

    await AppProviders({ children: null });

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedGetAccounts).toHaveBeenCalledTimes(1);
    expect(mockedGetCategories).toHaveBeenCalledTimes(1);
    expect(mockedGetSubcategories).toHaveBeenCalledTimes(1);
  });
});
