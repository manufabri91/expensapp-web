"use client";

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
  [
    ButtonType.Primary,
    "bg-teal-600 text-white hover:bg-teal-700",
  ],
  [
    ButtonType.Secondary,
    "bg-gray-100 px-5 py-2.5 text-sm font-medium text-teal-600 transition hover:text-teal-600/75 sm:block",
  ],
]);

export const Button = ({ type, label, onClick, ariaLabel, className }: Props) => {
  return (
    <button
      aria-label={ariaLabel ?? label}
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-medium block rounded-full transition ease-in-out ${buttonTypeClasses.get(
        type
      )} ${className}`}
    >
      {label}
    </button>
  );
};
