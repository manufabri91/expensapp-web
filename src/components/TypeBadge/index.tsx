'use client';
import { Chip } from '@heroui/chip';
import React, { FC } from 'react';
import { HiArrowTrendingDown, HiArrowTrendingUp } from 'react-icons/hi2';
import { LiaExchangeAltSolid } from 'react-icons/lia';
import { useTranslations } from 'use-intl';
import { TransactionType } from '@/types/enums/transactionType';

interface Props {
  type: TransactionType;
  size: 'sm' | 'md';
}

interface BadgeConfig {
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | undefined;
  icon: FC<React.SVGProps<SVGSVGElement>>;
}

const typeConfigMap = new Map<TransactionType, BadgeConfig>([
  [TransactionType.EXPENSE, { color: 'danger', icon: HiArrowTrendingDown }],
  [TransactionType.INCOME, { color: 'success', icon: HiArrowTrendingUp }],
]);

const getConfig = (type: TransactionType): BadgeConfig => {
  return typeConfigMap.get(type) ?? { color: undefined, icon: LiaExchangeAltSolid };
};

export const TypeBadge = ({ type, size }: Props) => {
  const t = useTranslations('Generics');
  const { color, icon: Icon } = getConfig(type);
  return (
    <Chip size={size} color={color} startContent={<Icon className="size-6 sm:size-4" />}>
      <span className="hidden sm:block">{t(`${type.toLowerCase()}.plural`)}</span>
    </Chip>
  );
};
