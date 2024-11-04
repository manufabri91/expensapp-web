"use client";

import { Button as FlowbiteButton } from "flowbite-react";

interface Props {
  type: ButtonType;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
}

const buttonTypeClasses = new Map<ButtonType, string>([
  [ButtonType.Primary, "bg-teal-600 text-white hover:bg-teal-700"],
  [
    ButtonType.Secondary,
    "bg-gray-100 dark:bg-slate-900 border-2 border-teal-600 px-5 py-2.5 text-sm font-medium text-teal-600 transition sm:block focus:ring-4 focus:ring-gray-100  dark:focus:ring-gray-800",
  ],
]);

export const Button = ({
  type,
  label,
  onClick,
  ariaLabel,
  className,
}: Props) => {
  return (
    <FlowbiteButton pill aria-label={ariaLabel} className={className} onClick={onClick} color={type}>{label}</FlowbiteButton>
  );
};
