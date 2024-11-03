"use client";

interface Props {
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
}

export const MenuButton = ({ onClick, ariaLabel,className }: Props) => {
  return (
    <button
    aria-label={ariaLabel}
    onClick={onClick}
    className={`block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 ${className}`}
  >
    <span className="sr-only">{ariaLabel}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
  );
};
