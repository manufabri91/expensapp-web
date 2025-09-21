'use client';

import { ButtonProps, Button as FlowbiteButton } from '@heroui/button';

export const Button = (props: ButtonProps) => {
  return (
    <FlowbiteButton radius="full" {...props}>
      {props.children}
    </FlowbiteButton>
  );
};
