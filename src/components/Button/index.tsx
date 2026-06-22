'use client';

import { ButtonProps, Button as HeroUIButton } from '@heroui/react';

export const Button = (props: ButtonProps) => {
  return (
    <HeroUIButton {...props} className={`rounded-full ${props.className ?? ''}`}>
      {props.children}
    </HeroUIButton>
  );
};
