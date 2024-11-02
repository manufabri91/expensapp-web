"use client";

interface Props {
  type: ButtonType;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
}

const buttonTypeClasses = new Map<ButtonType, string>([
  [
    ButtonType.Primary,
    "bg-blue-600 text-stone-100 hover:bg-blue-900 hover:text-stone-300 hover:border-stone-300 dark:bg-emerald-800 dark:border-stone-300 dark:text-stone-300 dark:hover:bg-teal-950",
  ],
  [
    ButtonType.Secondary,
    "bg-stone-100 text-slate-800 border-slate-800 hover:bg-stone-200 hover:text-slate-950 hover:border-slate-950 dark:bg-slate-800 dark:border-stone-100 dark:text-stone-100 dark:hover:bg-slate-900 dark:hover:border-stone-400 dark:hover:text-stone-400",
  ],
]);

export const Button = ({ type, label, onClick, ariaLabel }: Props) => {
  return (
    <button
      aria-label={ariaLabel || label}
      onClick={onClick}
      className={`px-4 py-2 rounded-full border-2 transition ease-in-out ${buttonTypeClasses.get(
        type
      )}`}
    >
      {label}
    </button>
  );
};
