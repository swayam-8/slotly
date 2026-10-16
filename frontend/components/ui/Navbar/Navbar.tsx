import Link from 'next/link';
import { createClient } from '@backend/lib/supabase/server';
import { ArrowRight, CalendarDays } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error && error.name !== 'AuthSessionMissingError') {
    throw new Error(`Could not load navigation session: ${error.message}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <span className="text-lg">Slotly</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex"
        >
          <Link
            className="transition-colors hover:text-foreground"
            href="/#features"
          >
            Features
          </Link>
          <Link
            className="transition-colors hover:text-foreground"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="transition-colors hover:text-foreground"
            href="/#faq"
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground transition hover:brightness-95"
            >
              Go to dashboard{' '}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signin/password_signin"
                className="shrink-0 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:px-3"
              >
                Log in
              </Link>
              <Link
                href="/signin/signup"
                className="inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-brand px-3 text-sm font-medium text-brand-foreground transition hover:brightness-95 sm:px-4"
              >
                Get started <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
