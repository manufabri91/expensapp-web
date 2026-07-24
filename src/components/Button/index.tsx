'use client';

import { ButtonProps, Button as HeroUIButton } from '@heroui/react';

export const Button = (props: ButtonProps) => {
  return <HeroUIButton {...props}>{props.children}</HeroUIButton>;
};
