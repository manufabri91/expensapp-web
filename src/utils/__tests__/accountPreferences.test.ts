import { AccountResponse } from '@/types/dto';
import { parseAccountPreferences, resolveOpeningAccount, validAccountPreferences } from '../accountPreferences';
const accounts: AccountResponse[] = [1, 2, 3].map((id) => ({
  id,
  name: String(id),
  currency: 'USD',
  accountBalance: 0,
  initialBalance: 0,
}));
describe('account preferences', () => {
  it.each([null, '{', 'null', '4', '"text"'])('recovers from invalid storage %s', (raw) => {
    expect(parseAccountPreferences(raw)).toEqual({});
  });
  it('only reads valid numeric ids', () => {
    expect(parseAccountPreferences('{"defaultAccountId":"1","recentAccountId":2}')).toEqual({
      defaultAccountId: undefined,
      recentAccountId: 2,
    });
  });
  it('uses the first valid candidate in priority order, never the first account', () => {
    expect(resolveOpeningAccount(accounts, [99, 3, 2, 1])).toBe(3);
    expect(resolveOpeningAccount(accounts, [undefined, 99])).toBeUndefined();
  });
  it('removes deleted accounts from preferences', () => {
    expect(validAccountPreferences(accounts, { defaultAccountId: 99, recentAccountId: 2 })).toEqual({
      defaultAccountId: undefined,
      recentAccountId: 2,
    });
  });
});
