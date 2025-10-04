interface Props {
  className?: string;
}

export const CardSkeleton = ({ className }: Props) => {
  return (
    <div
      role="status"
      className={`max-w-sm animate-pulse rounded border border-gray-200 bg-white p-4 shadow md:p-6 dark:border-gray-700 dark:bg-slate-800 ${className}`}
    >
      <div className="mb-4 h-2.5 w-48 rounded-full bg-gray-200 dark:bg-slate-700"></div>
      <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>

      <span className="sr-only">Loading...</span>
    </div>
  );
};
