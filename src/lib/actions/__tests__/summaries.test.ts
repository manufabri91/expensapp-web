/**
 * @jest-environment node
 */
import { getProgrammedTransactions, getUpcomingTransactions } from '@/lib/actions/summaries';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const lastFetchRequest = () => {
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  return { url, init };
};

describe('summaries actions', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  describe('getUpcomingTransactions', () => {
    it('fetches from the backend upcoming-transactions endpoint', async () => {
      const upcomingTransactionsResponse = { expenses: [], incomes: [] };
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify(upcomingTransactionsResponse), { status: 200 })
      );

      const result = await getUpcomingTransactions();

      expect(result).toEqual(upcomingTransactionsResponse);
      const { url } = lastFetchRequest();
      expect(url).toBe('https://backend.test/summary/upcoming-transactions');
    });

    it('throws when the backend response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(getUpcomingTransactions()).rejects.toThrow('Failed to fetch upcoming transactions');
    });
  });

  describe('getProgrammedTransactions', () => {
    it('fetches from the backend programmed-transactions endpoint', async () => {
      const programmedTransactionsResponse = { expenses: [], incomes: [] };
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify(programmedTransactionsResponse), { status: 200 })
      );

      const result = await getProgrammedTransactions();

      expect(result).toEqual(programmedTransactionsResponse);
      const { url } = lastFetchRequest();
      expect(url).toBe('https://backend.test/summary/programmed-transactions');
    });

    it('throws when the backend response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(getProgrammedTransactions()).rejects.toThrow('Failed to fetch programmed transactions');
    });
  });
});
