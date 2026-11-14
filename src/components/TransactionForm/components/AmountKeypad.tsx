import { useTranslations } from 'next-intl';
import { HiBackspace } from 'react-icons/hi2';
import { Button } from '@/components/Button';

export const AmountKeypad = ({ decimal, onPress }: { decimal: string; onPress: (key: string) => void }) => {
  const t = useTranslations('AmountFlow');
  const operators = [
    { key: '+', label: '+', name: 'add' },
    { key: '-', label: '−', name: 'subtract' },
    { key: '*', label: '×', name: 'multiply' },
    { key: '/', label: '÷', name: 'divide' },
    { key: '=', label: '=', name: 'equals' },
  ];
  return (
    <div className="flex flex-col gap-3" aria-label={t('calculator')}>
      <div className="grid grid-cols-5 gap-2">
        {operators.map(({ key, label, name }) => (
          <Button
            key={key}
            fullWidth
            type="button"
            variant="secondary"
            aria-label={t(name)}
            className="min-h-11 min-w-0 rounded-full text-xl"
            onPress={() => onPress(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'Backspace'].map((key) => (
          <Button
            key={key}
            fullWidth
            type="button"
            variant="secondary"
            className="min-h-12 min-w-0 rounded-xl text-2xl"
            aria-label={key === 'Backspace' ? t('backspace') : key === '.' ? t('decimal') : key}
            onPress={() => onPress(key)}
          >
            {key === 'Backspace' ? <HiBackspace aria-hidden="true" /> : key === '.' ? decimal : key}
          </Button>
        ))}
      </div>
    </div>
  );
};
