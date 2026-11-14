import { calculatorKey, calculatorResult, initialCalculator, parsePastedAmount } from '../amountCalculator';

const enter = (keys: string[], value = 0) => keys.reduce(calculatorKey, initialCalculator(value));
describe('amount calculator', () => {
  it('evaluates sequentially rather than applying operator precedence', () => {
    const state = enter(['2', '+', '3', '*', '4']);
    expect(calculatorResult(state)).toEqual({ value: 20 });
  });
  it.each([
    [['0', '.', '1', '+', '0', '.', '2', '='], 0.3],
    [['1', '/', '3', '*', '3', '='], 1],
    [['1', '/', '8', '='], 0.13],
    [['9', '-', '1', '0', '+', '2', '='], 1],
    [['8', '+', '*', '2', '='], 16],
    [['4', '=', '=', '+', '2', '='], 6],
    [['4', '=', '7'], 7],
    [['1', '2', 'Backspace', '3'], 13],
    [['.', '5'], 0.5],
    [['0', '0', '2'], 2],
    [['1', '.', '2', '3', '4'], 1.23],
    [['1', '.', '.', '2'], 1.2],
  ])('calculates %j as %s', (keys, expected) => {
    const state = enter(keys);
    expect(calculatorResult(state)).toEqual({ value: expected });
  });
  it.each([
    [['0'], 'invalidAmount'],
    [['2', '-', '3'], 'invalidAmount'],
    [['2', '+'], 'incomplete'],
    [['2', '+', '='], 'incomplete'],
    [['1', '/', '0', '='], 'divisionByZero'],
    [['9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9'], 'overflow'],
  ])('rejects invalid or incomplete calculations %j', (keys, error) => {
    expect(calculatorResult(enter(keys))).toEqual({ error });
  });
  it('clears errors and calculations with Delete', () => {
    expect(enter(['1', '/', '0', '=', 'Delete'])).toEqual(initialCalculator());
  });
  it('rejects overflowing arithmetic and can recover by clearing', () => {
    const state = enter(['*', '9', '='], 90071992547409);
    expect(state.error).toBe('overflow');
    expect(calculatorKey(state, 'Delete')).toEqual(initialCalculator());
  });
  it('ignores unrelated keys and deletes a single negative digit safely', () => {
    expect(calculatorKey(initialCalculator(), 'Escape')).toEqual(initialCalculator());
    expect(calculatorKey(enter(['1', '-', '2', '=']), 'Backspace').entry).toBe('0');
  });
  it.each([
    ['1,234.50', 'en', '1234.50'],
    ['1.234,50', 'es', '1234.50'],
    ['1234,5', 'es-AR', '1234.5'],
    [' 12.50 ', 'en', '12.50'],
  ])('parses localized paste %s', (text, locale, expected) => {
    expect(parsePastedAmount(text, locale)).toBe(expected);
  });
  it.each(['1+2', '-1', '1e2', '1,23.50', '1.234', 'NaN', '1.2.3', '900719925474099999'])(
    'rejects malformed paste %s',
    (text) => {
      expect(parsePastedAmount(text, 'en')).toBeUndefined();
    }
  );
});
