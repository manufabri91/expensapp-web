import { fireEvent, render, screen } from '@testing-library/react';
import useSWR from 'swr';
import RecentMonthsBalanceChart from '@/app/dashboard/components/Summary/RecentMonthsBalanceChart';
import { getMonthlyHistory } from '@/lib/actions/summaries';
import { MonthlyBalanceSummaryResponse } from '@/types/dto';

jest.mock('swr');
jest.mock('@/lib/actions/summaries', () => ({ getMonthlyHistory: jest.fn() }));
// RecentMonthsBalanceChart imports Money via the `@/components` barrel, which also re-exports
// Navbar/LocaleSwitcher and transitively next-auth - that pulls in a `Request` global that isn't
// polyfilled in the jsdom test environment. Stub the barrel down to just what this component uses.
jest.mock('@/components', () => ({
  Money: ({ amount, className }: { amount: number; className?: string }) => <div className={className}>{amount}</div>,
}));
jest.mock('@/components/BalanceAreaChart', () => ({
  BalanceAreaChart: () => <div data-testid="balance-area-chart" />,
  INCOME_COLOR: '#000',
  EXPENSE_COLOR: '#fff',
}));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}::${JSON.stringify(values)}` : key,
}));

const mockedUseSWR = useSWR as jest.Mock;
const mockedGetMonthlyHistory = getMonthlyHistory as jest.Mock;

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

const buildData = (): MonthlyBalanceSummaryResponse[] => [
  { year: CURRENT_YEAR, month: CURRENT_MONTH, currency: 'USD', incomes: 500, expenses: 200 },
];

describe('RecentMonthsBalanceChart', () => {
  beforeEach(() => {
    mockedUseSWR.mockReturnValue({ data: undefined, isValidating: false, mutate: jest.fn() });
    mockedGetMonthlyHistory.mockResolvedValue(buildData());
  });

  it('renders the includePending switch checked by default', () => {
    render(<RecentMonthsBalanceChart data={buildData()} currency="USD" locale="en" />);

    const includePendingSwitch = screen.getByRole('switch', {
      name: 'Dashboard.summary.balance.lastMonths.includePending',
    }) as HTMLInputElement;

    expect(includePendingSwitch.checked).toBe(true);
  });

  it('uses a default SWR key/fallbackData that matches the server-fetched state (months=6, includePending=true)', () => {
    const data = buildData();
    render(<RecentMonthsBalanceChart data={data} currency="USD" locale="en" />);

    const [key, , options] = mockedUseSWR.mock.calls[0];
    expect(key).toEqual(['monthly-history', 6, true]);
    expect(options).toMatchObject({ fallbackData: data });
  });

  it('toggling the switch off refetches with includePending=false and drops the fallbackData', () => {
    render(<RecentMonthsBalanceChart data={buildData()} currency="USD" locale="en" />);

    const includePendingSwitch = screen.getByRole('switch', {
      name: 'Dashboard.summary.balance.lastMonths.includePending',
    });
    fireEvent.click(includePendingSwitch);

    const lastCall = mockedUseSWR.mock.calls[mockedUseSWR.mock.calls.length - 1];
    const [key, fetcher, options] = lastCall;
    expect(key).toEqual(['monthly-history', 6, false]);
    expect(options).toMatchObject({ fallbackData: undefined });

    fetcher();
    expect(mockedGetMonthlyHistory).toHaveBeenCalledWith(6, false);
  });

  it('toggling the period selector preserves the current includePending state instead of resetting it', () => {
    render(<RecentMonthsBalanceChart data={buildData()} currency="USD" locale="en" />);

    fireEvent.click(screen.getByRole('switch', { name: 'Dashboard.summary.balance.lastMonths.includePending' }));

    fireEvent.click(screen.getByText('3M'));

    const lastCall = mockedUseSWR.mock.calls[mockedUseSWR.mock.calls.length - 1];
    const [key, fetcher] = lastCall;
    expect(key).toEqual(['monthly-history', 3, false]);

    fetcher();
    expect(mockedGetMonthlyHistory).toHaveBeenCalledWith(3, false);
  });
});
