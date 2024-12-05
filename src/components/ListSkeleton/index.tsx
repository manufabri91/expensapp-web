interface Props {
  className?: string;
  rows?: number;
  cols?: number;
}

export const ListSkeleton = ({ className, rows = 1, cols = 5 }: Props) => (
  <div
    role="status"
    className={`max-w-full animate-pulse space-y-4 divide-y divide-gray-200 rounded border border-gray-200 bg-white p-4 shadow dark:divide-gray-700 dark:border-gray-700 dark:bg-slate-800 md:p-6 ${className}`}
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`flex items-center justify-between ${i !== 0 ? 'pt-4' : ''}`}>
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j}>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
        ))}
        <div className="h-2.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
      </div>
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);
