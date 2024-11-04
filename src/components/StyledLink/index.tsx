import Link from 'next/link';

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

const buttonLinkClasses = new Map<LinkType, string>([
  [LinkType.Primary, 'bg-teal-600 text-white hover:bg-teal-700'],
  [
    LinkType.Secondary,
    'bg-gray-100 dark:bg-slate-900 border-2 border-teal-600 px-5 py-2.5 text-sm font-medium text-teal-600 transition hover:text-teal-600/75 dark:hover:bg-stone-100/20 dark:hover:text-teal-600 sm:block',
  ],
]);

const textLinkClasses = new Map<LinkType, string>([
  [LinkType.Primary, 'text-teal-600 hover:text-teal-700'],
  [LinkType.Secondary, 'text-gray-500 dark:text-stone-300 hover:text-gray-500/75 dark:hover:text-stone-300/75'],
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
  let linkClasses = textLinkClasses.get(type) ?? textLinkClasses.get(LinkType.Primary)!;

  if (style === LinkStyle.Button && buttonLinkClasses.has(type)) {
    linkClasses = `px-5 py-2.5 text-sm font-medium block rounded-full transition ease-in-out  ${buttonLinkClasses.get(
      type
    )!}`;
  }

  return (
    <Link href={href} className={`${linkClasses} ${className}`} rel={rel} target={target}>
      {children}
    </Link>
  );
};
