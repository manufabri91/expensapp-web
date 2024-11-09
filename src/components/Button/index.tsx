'use client';

import { ButtonProps, Button as FlowbiteButton } from 'flowbite-react';

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
}

const buttonConfigMap = new Map<ButtonVariant, Record<string, string | boolean>>([
  [ButtonVariant.Primary, { gradientDuoTone: 'greenToBlue' }],
  [ButtonVariant.Secondary, { gradientDuoTone: 'greenToBlue', outline: true }],
]);

export const Button = (props: ButtonProps & { variant: ButtonVariant }) => {
  return (
    <FlowbiteButton pill {...buttonConfigMap.get(props.variant)!} {...props}>
      {props.children}
    </FlowbiteButton>
  );
};
