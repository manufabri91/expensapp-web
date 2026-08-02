import clsx from 'clsx';
import { HiArrowDown, HiArrowRight, HiArrowUp } from 'react-icons/hi2';

export const TrendIcon = ({ amount, className }: { amount: number; className?: string }) => {
  const classes = clsx('text-xl font-bold', className);
  if (amount < 0) {
    return <HiArrowDown className={classes + ' text-red-600'} />;
  }
  if (amount > 0) {
    return <HiArrowUp className={classes + ' text-emerald-600 dark:text-emerald-500'} />;
  }
  return <HiArrowRight className={classes + ' text-amber-600 dark:text-amber-300'} />;
};
