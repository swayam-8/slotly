import Link from 'next/link';
import { CalendarDays, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
              <CalendarDays aria-hidden="true" className="size-4" />
            </span>
            Slotly
          </Link>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            More time for your customers. Less time spent coordinating your
            calendar.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
        >
          <Link className="hover:text-foreground" href="/pricing">
            Pricing
          </Link>
          <Link className="hover:text-foreground" href="/signin/signup">
            Create account
          </Link>
          <Link
            className="hover:text-foreground"
            href="/signin/password_signin"
          >
            Log in
          </Link>
          <a className="hover:text-foreground" href="mailto:hello@slotly.app">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:col-span-2 md:justify-between">
          <span>
            © {new Date().getFullYear()} Slotly. All rights reserved.
          </span>
          <span className="inline-flex items-center gap-1">
            Made for your next chapter{' '}
            <Heart aria-hidden="true" className="size-3 text-brand" />
          </span>
        </div>
      </div>
    </footer>
  );
}
