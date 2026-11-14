import { useState } from 'react';
import { calculatorKey, calculatorResult, initialCalculator, parsePastedAmount } from '@/utils/amountCalculator';

export const useAmountCalculator = (locale: string) => {
  const [state, setState] = useState(initialCalculator);
  const result = calculatorResult(state);
  const press = (key: string, replace = false) =>
    setState((previous) => {
      const next = calculatorKey(replace ? initialCalculator() : previous, key);
      return key === '=' ? { ...next, error: next.error ?? calculatorResult(next).error } : next;
    });
  const paste = (text: string) => {
    const entry = parsePastedAmount(text, locale);
    setState((previous) =>
      entry === undefined ? { ...previous, error: 'invalidPaste' } : { ...initialCalculator(), entry, replace: false }
    );
  };
  return { state, result, press, paste, reset: (value = 0) => setState(initialCalculator(value)) };
};
export type AmountCalculator = ReturnType<typeof useAmountCalculator>;
