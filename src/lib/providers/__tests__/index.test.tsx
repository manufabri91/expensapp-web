/**
 * @jest-environment node
 */
import { getAccounts } from '@/lib/actions/accounts';
import { getCategories } from '@/lib/actions/categories';
import { getSubcategories } from '@/lib/actions/subcategories';
import { getUserSettings } from '@/lib/actions/userSettings';
import { auth } from '@/lib/auth';
import { AppProviders } from '@/lib/providers';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/actions/accounts', () => ({ getAccounts: jest.fn() }));
jest.mock('@/lib/actions/categories', () => ({ getCategories: jest.fn() }));
jest.mock('@/lib/actions/subcategories', () => ({ getSubcategories: jest.fn() }));
jest.mock('@/lib/actions/userSettings', () => ({ getUserSettings: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;
const mockedGetAccounts = getAccounts as unknown as jest.Mock;
const mockedGetCategories = getCategories as unknown as jest.Mock;
const mockedGetSubcategories = getSubcategories as unknown as jest.Mock;
const mockedGetUserSettings = getUserSettings as unknown as jest.Mock;

describe('AppProviders', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children directly without fetching data when there is no session', async () => {
    mockedAuth.mockResolvedValue(null);

    await AppProviders({ children: null });

    expect(mockedGetAccounts).not.toHaveBeenCalled();
  });

  // A session with `error` set (the jwt() callback in src/lib/auth/config.ts failed to refresh
  // the access token) still has a stale bearer token in session.user.token. AppProviders lives in
  // the root layout, so it renders on *every* route, including whichever public route a redirect
  // would target - redirecting from here therefore loops (ERR_TOO_MANY_REDIRECTS), since nothing
  // can clear the errored session cookie from a Server Component (cookies can only be mutated in
  // a Server Action/Route Handler/Middleware). Instead, degrade like the no-session case: skip
  // the data fetch and render children as-is. proxy.ts's own isAuthenticated check already
  // treats session.error as unauthenticated and owns the actual redirect-away for protected
  // routes, without looping.
  it('skips the data fetch (without redirecting) when the session has a refresh error', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'stale-token' }, error: 'RefreshAccessTokenError' });

    await AppProviders({ children: null });

    expect(mockedGetAccounts).not.toHaveBeenCalled();
    expect(mockedGetCategories).not.toHaveBeenCalled();
    expect(mockedGetSubcategories).not.toHaveBeenCalled();
  });

  it('fetches data when the session is valid', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'valid-token' } });
    mockedGetCategories.mockResolvedValue([]);
    mockedGetSubcategories.mockResolvedValue([]);
    mockedGetAccounts.mockResolvedValue([]);
    mockedGetUserSettings.mockResolvedValue({ theme: 'system', locale: 'en' });

    await AppProviders({ children: null });

    expect(mockedGetAccounts).toHaveBeenCalledTimes(1);
    expect(mockedGetCategories).toHaveBeenCalledTimes(1);
    expect(mockedGetSubcategories).toHaveBeenCalledTimes(1);
    expect(mockedGetUserSettings).toHaveBeenCalledTimes(1);
  });
});
