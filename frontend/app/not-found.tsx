import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { CalendarDays } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="grid min-h-[65dvh] place-items-center px-5 py-16 text-center"
      >
        <div className="max-w-lg">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-muted text-brand">
            <CalendarDays aria-hidden="true" className="size-7" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">
            404 · Page not found
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            We couldn&apos;t find that page.
          </h1>
          <p className="mt-3 text-muted-foreground">
            The link may be out of date, or this business page may not be
            available.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground hover:brightness-95"
          >
            Back to Slotly
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
