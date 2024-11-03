import Link from "next/link";

export interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: LinkStyle;
    type?: LinkType;
}

export enum LinkStyle {
  Button = "button",
  Text = "text",
}

export enum LinkType {
  Primary = "primary",
  Secondary = "secondary",
}

const linkTypeClasses = new Map<LinkType, string>([
  [
    LinkType.Primary,
    "bg-teal-600 text-white hover:bg-teal-700",
  ],
  [
    LinkType.Secondary,
    "bg-gray-100 px-5 py-2.5 text-sm font-medium text-teal-600 transition hover:text-teal-600/75 sm:block",
  ],
]);

export const StyledLink = ({ href, children, className, style = LinkStyle.Text, type = LinkType.Primary }: Props) => {
  let linkClasses = "text-gray-500 transition hover:text-gray-500/75";

  if (style === LinkStyle.Button && linkTypeClasses.has(type)) {
    linkClasses = `px-5 py-2.5 text-sm font-medium block rounded-full transition ease-in-out  ${linkTypeClasses.get(type)!}`;
  }

  return (
    <Link
      href={href}
      className={`${linkClasses} ${className}`}
    >
      {children}
    </Link>
  );
};
