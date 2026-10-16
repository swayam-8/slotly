'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/primitives';
import { ErrorState } from '@/components/ui/primitives';

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application route failed:', error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-dvh max-w-xl content-center gap-5 px-5">
      <h1 className="text-3xl font-semibold">We hit a snag.</h1>
      <ErrorState
        description="The page could not be loaded. Please try again, or return to the home page."
        onRetry={reset}
      />
      <Link href="/" className="w-fit">
        <Button variant="outline">Return home</Button>
      </Link>
    </main>
  );
}
