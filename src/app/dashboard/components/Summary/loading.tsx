import { CardSkeleton } from '@/components';

export default function Loading() {
  return (
    <div className="flex w-full flex-col justify-center gap-4 md:flex md:flex-row md:flex-wrap">
      <CardSkeleton className="mt-4" />
      <CardSkeleton className="mt-4" />
      <CardSkeleton className="mt-4" />
    </div>
  );
}
