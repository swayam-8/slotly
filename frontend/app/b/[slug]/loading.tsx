import { Skeleton } from '@/components/ui/primitives';

export default function BookingLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="h-20 rounded-2xl" />
      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
        <Skeleton className="hidden h-64 rounded-2xl lg:block" />
      </div>
    </main>
  );
}
