import { Skeleton } from '@heroui/skeleton';

interface Props {
  className?: string;
  rows?: number;
  cols?: number;
}

export const ListSkeleton = ({ className, rows = 1, cols = 5 }: Props) => (
  <div className={`flex w-full flex-col gap-5 bg-neutral-900 p-4 ${className}`}>
    <Skeleton className="h-8 w-full rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex w-full items-center gap-3 px-2">
        <div>
          <Skeleton className="flex size-6 rounded-full" />
        </div>
        <div className="flex w-full">
          <Skeleton className="h-3 w-4/5 rounded-lg" />
        </div>
        {Array.from({ length: cols - 1 }).map((_, j) => (
          <div key={j} className="flex w-full">
            <Skeleton className="h-3 w-3/5 rounded-lg" />
          </div>
        ))}
      </div>
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);
