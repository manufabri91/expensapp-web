import { useLocale, useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Button } from '@/components/Button';
import { AmountCalculator } from '../useAmountCalculator';

export const AmountEntry = ({
  calculator,
  currency,
  onContinue,
}: {
  calculator: AmountCalculator;
  currency?: string;
  onContinue: () => void;
}) => {
  const t = useTranslations('AmountFlow');
  const locale = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const decimal =
    new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
  const currencyParts = new Intl.NumberFormat(locale, { style: 'currency', currency: currency ?? 'USD' }).formatToParts(
    0
  );
  const symbol = currency ? currencyParts.find((part) => part.type === 'currency')?.value : '';
  const prefix =
    currencyParts.findIndex((part) => part.type === 'currency') <
    currencyParts.findIndex((part) => part.type === 'integer');
  const press = (key: string, replace = false) => {
    calculator.press(key, replace);
    input.current?.focus();
  };
  const displayValue =
    calculator.state.replace && !calculator.state.operator && calculator.state.entry !== '0'
      ? new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          Number(calculator.state.entry)
        )
      : calculator.state.entry.replace('.', decimal);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="transaction-amount" className="text-muted text-sm">
          {t('amount')}
        </label>
        <Button type="button" variant="ghost" size="sm" onPress={() => press('Delete')}>
          {t('clear')}
        </Button>
      </div>
      <div
        className="flex min-w-0 items-center gap-1 font-semibold tabular-nums"
        style={{ fontSize: `${Math.min(56, Math.max(16, 380 / (displayValue.length + (symbol?.length ?? 0))))}px` }}
      >
        {prefix && <span aria-hidden="true">{symbol}</span>}
        <input
          id="transaction-amount"
          ref={input}
          autoFocus
          inputMode="none"
          autoComplete="off"
          className="text-foreground focus:border-accent w-full min-w-0 rounded-none border-0 border-b-2 border-transparent bg-transparent p-0 shadow-none focus:outline-none"
          aria-label={t('amount')}
          aria-describedby="amount-calculation amount-error"
          aria-invalid={!!calculator.state.error}
          value={displayValue}
          onChange={(event) => calculator.paste(event.target.value)}
          onPaste={(event) => {
            event.preventDefault();
            calculator.paste(event.clipboardData.getData('text'));
          }}
          onKeyDown={(event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            const key = event.key === decimal ? '.' : event.key;
            if (key === 'Enter') {
              event.preventDefault();
              if (calculator.state.operator) press('=');
              else onContinue();
            } else if (/^[\d.+*/=-]$/.test(key) || key === 'Backspace' || key === 'Delete') {
              event.preventDefault();
              const target = event.currentTarget;
              const replace =
                /^[\d.]$/.test(key) && target.selectionStart === 0 && target.selectionEnd === target.value.length;
              press(key, replace);
            }
          }}
        />
        {!prefix && <span aria-hidden="true">{symbol}</span>}
      </div>
      <p
        id="amount-calculation"
        hidden={!calculator.state.expression}
        className="text-muted min-h-5 text-sm break-words"
        aria-live="polite"
      >
        {calculator.state.expression.replaceAll('.', decimal)}
      </p>
      <p
        id="amount-error"
        hidden={!calculator.state.error}
        className="text-danger text-sm"
        role={calculator.state.error ? 'alert' : undefined}
      >
        {calculator.state.error ? t(calculator.state.error) : ''}
      </p>
    </div>
  );
};
