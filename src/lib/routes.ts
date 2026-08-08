export const HOME = '/';
export const SIGN_IN = '/auth/signin';
export const REGISTER = '/auth/register';
export const FORGOT_PASSWORD = '/auth/forgot-password';
export const PUBLIC_ROUTES = [HOME, SIGN_IN, REGISTER, FORGOT_PASSWORD];
export const PRIVACY_POLICY = '/legal/privacy-policy';
export const TERMS_OF_USE = '/legal/terms-of-use';
export const COOKIE_POLICY = '/legal/cookie-policy';
// Routes that skip the "must be authenticated" redirect WITHOUT the "bounce away if already
// authenticated" behavior PUBLIC_ROUTES also applies - legal pages must stay reachable for a
// logged-in user clicking a footer link, not redirect them to /dashboard.
export const UNRESTRICTED_ROUTES = [PRIVACY_POLICY, TERMS_OF_USE, COOKIE_POLICY];
export const DEFAULT_REDIRECT = '/dashboard';
