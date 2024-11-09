import Link from 'next/link';

import { Button, ButtonVariant } from '@/components/Button';

export interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: LinkStyle;
  type?: LinkType;
  rel?: string;
  target?: string;
}

export enum LinkStyle {
  Button = 'button',
  Text = 'text',
}

export enum LinkType {
  Primary = 'primary',
  Secondary = 'secondary',
}

const textLinkClasses = new Map<LinkType, string>([
  [LinkType.Primary, 'text-teal-600 hover:text-teal-700'],
  [LinkType.Secondary, 'text-gray-500 dark:text-stone-300 hover:text-gray-500/75 dark:hover:text-stone-300/75'],
]);

const linkTypeToButtonMap = new Map<LinkType, ButtonVariant>([
  [LinkType.Primary, ButtonVariant.Primary],
  [LinkType.Secondary, ButtonVariant.Secondary],
]);

export const StyledLink = ({
  href,
  children,
  className,
  style = LinkStyle.Text,
  type = LinkType.Primary,
  rel,
  target,
}: Props) => {
  if (style === LinkStyle.Text) {
    return (
      <Link
        href={href}
        className={`${textLinkClasses.get(type) ?? textLinkClasses.get(LinkType.Primary)!} ${className}`}
        rel={rel}
        target={target}
      >
        {children}
      </Link>
    );
  }

  return (
    <Button variant={linkTypeToButtonMap.get(type)!}>
      <Link href={href} className={className} rel={rel} target={target}>
        {children}
      </Link>
    </Button>
  );
};
