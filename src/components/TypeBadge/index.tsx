import { TransactionType } from '@/types/enums/transactionType';
import { Badge } from 'flowbite-react';
import { getTranslations } from 'next-intl/server';
import React, { FC } from 'react';
import { HiArrowTrendingDown, HiArrowTrendingUp } from 'react-icons/hi2';
import { LiaExchangeAltSolid } from 'react-icons/lia';

interface Props {
  type: TransactionType;
  size: 'xs' | 'sm';
}

interface BadgeConfig {
  color?: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
}

const typeConfigMap = new Map<TransactionType, BadgeConfig>([
  [TransactionType.EXPENSE, { color: 'red', icon: HiArrowTrendingDown }],
  [TransactionType.INCOME, { color: 'green', icon: HiArrowTrendingUp }],
]);

const getConfig = (type: TransactionType): BadgeConfig => {
  return typeConfigMap.get(type) ?? { color: undefined, icon: LiaExchangeAltSolid };
};

export const TypeBadge = async ({ type, size }: Props) => {
  const t = await getTranslations('Generics');
  const config = getConfig(type);
  return (
    <Badge size={size} icon={config.icon} color={config.color}>
      {t(`${type.toLowerCase()}.plural`)}
    </Badge>
  );
};
