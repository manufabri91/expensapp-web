'use client';

import { Button as FlowbiteButton } from 'flowbite-react';

interface Props {
  type: ButtonType;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
}

export const Button = ({ type, label, onClick, ariaLabel, className }: Props) => {
  return (
    <FlowbiteButton pill aria-label={ariaLabel} className={className} onClick={onClick} color={type}>
      {label}
    </FlowbiteButton>
  );
};
