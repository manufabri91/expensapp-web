'use client';

import { Button as FlowbiteButton } from 'flowbite-react';

interface Props {
  type: ButtonType;
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
}

const buttonConfigMap = new Map<ButtonType, Record<string, string | boolean>>([
  [ButtonType.Primary, { gradientDuoTone: 'greenToBlue' }],
  [ButtonType.Secondary, { gradientDuoTone: 'greenToBlue', outline: true }],
]);

export const Button = ({ type, children, onClick, ariaLabel, className }: Props) => {
  return (
    <FlowbiteButton pill aria-label={ariaLabel} className={className} onClick={onClick} {...buttonConfigMap.get(type)!}>
      {children}
    </FlowbiteButton>
  );
};
