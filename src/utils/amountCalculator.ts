import Decimal from 'decimal.js';

const MoneyDecimal = Decimal.clone({ precision: 28, rounding: Decimal.ROUND_HALF_UP });
export type Operator = '+' | '-' | '*' | '/';
export interface CalculatorState {
  entry: string;
  accumulator?: string;
  operator?: Operator;
  expression: string;
  replace: boolean;
  error?: 'invalidAmount' | 'incomplete' | 'divisionByZero' | 'overflow' | 'invalidPaste';
}
export const initialCalculator = (value = 0): CalculatorState => ({
  entry: String(value),
  expression: '',
  replace: true,
});
export const operatorSymbol = (operator: string) => ({ '*': '×', '/': '÷', '-': '−' })[operator] ?? operator;
const safeAmount = (value: Decimal) => value.isFinite() && value.abs().times(100).lte(Number.MAX_SAFE_INTEGER);
const calculate = (left: string, operator: Operator, right: string) => {
  const operand = new MoneyDecimal(left);
  if (operator === '+') return operand.plus(right);
  if (operator === '-') return operand.minus(right);
  if (operator === '*') return operand.times(right);
  return operand.div(right);
};
export const calculatorResult = (state: CalculatorState): { value?: number; error?: CalculatorState['error'] } => {
  if (state.error) return { error: state.error };
  if (state.operator && state.replace) return { error: 'incomplete' };
  if (state.operator === '/' && new MoneyDecimal(state.entry).isZero()) return { error: 'divisionByZero' };
  const result =
    state.operator && state.accumulator !== undefined
      ? calculate(state.accumulator, state.operator, state.entry)
      : new MoneyDecimal(state.entry);
  const rounded = result.toDecimalPlaces(2);
  if (!safeAmount(rounded)) return { error: 'overflow' };
  if (rounded.lte(0)) return { error: 'invalidAmount' };
  return { value: rounded.toNumber() };
};
const evaluate = (state: CalculatorState, round: boolean): CalculatorState => {
  if (!state.operator || state.accumulator === undefined) return { ...state, replace: true };
  if (state.replace) return { ...state, error: 'incomplete' };
  if (state.operator === '/' && new MoneyDecimal(state.entry).isZero()) return { ...state, error: 'divisionByZero' };
  const result = calculate(state.accumulator, state.operator, state.entry);
  if (!safeAmount(result)) return { ...state, error: 'overflow' };
  return {
    entry: (round ? result.toDecimalPlaces(2) : result).toFixed(),
    expression: `${state.accumulator} ${operatorSymbol(state.operator)} ${state.entry} =`,
    replace: true,
  };
};
const appendDigit = (state: CalculatorState, key: string): CalculatorState => {
  const previous = state.replace ? '' : state.entry;
  const entry = key === '.' ? (previous || '0') + '.' : (previous === '0' ? '' : previous) + key;
  if (!/^-?\d+(\.\d{0,2})?$/.test(entry)) return state;
  if (!safeAmount(new MoneyDecimal(entry))) return { ...state, error: 'overflow' };
  return {
    ...state,
    entry,
    expression: state.replace && !state.operator ? '' : state.expression,
    replace: false,
    error: undefined,
  };
};
export const calculatorKey = (state: CalculatorState, key: string): CalculatorState => {
  if (/^\d$/.test(key) || key === '.') return appendDigit(state, key);
  if (key === 'Delete') return initialCalculator();
  if (key === 'Backspace')
    return { ...state, entry: state.entry.slice(0, -1).replace(/^-$/, '') || '0', replace: false, error: undefined };
  if (key === '=') return evaluate({ ...state, error: undefined }, true);
  if (!['+', '-', '*', '/'].includes(key)) return state;
  const evaluated = state.operator && !state.replace ? evaluate(state, false) : { ...state, error: undefined };
  if (evaluated.error) return evaluated;
  return {
    ...evaluated,
    accumulator: evaluated.entry,
    operator: key as Operator,
    expression: `${evaluated.entry} ${operatorSymbol(key)}`,
    replace: true,
  };
};

// Paste accepts one locale-formatted amount, never expressions. Validate grouping before removing it.
export const parsePastedAmount = (text: string, locale: string): string | undefined => {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find((part) => part.type === 'group')?.value ?? ',';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^(?:\\d+|\\d{1,3}(?:${escape(group)}\\d{3})+)(?:${escape(decimal)}\\d{1,2})?$`);
  const trimmed = text.trim();
  if (!pattern.test(trimmed)) return undefined;
  const normalized = trimmed.split(group).join('').replace(decimal, '.');
  return safeAmount(new MoneyDecimal(normalized)) ? normalized : undefined;
};
