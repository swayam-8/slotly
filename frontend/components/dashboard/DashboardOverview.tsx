'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  UserRoundX
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader
} from '@/components/ui/primitives';
import type { getOverviewPlaceholderData } from '@/utils/placeholders/dashboard';

const icons = {
  calendar: CalendarDays,
  revenue: CircleDollarSign,
  upcoming: Clock3,
  noshow: UserRoundX
};

export default function DashboardOverview({
  data
}: {
  data: Awaited<ReturnType<typeof getOverviewPlaceholderData>>;
}) {
  const { business } = useDashboard();
  return (
    <section className="grid gap-6">
      <PageHeader
        title="Overview"
        description={`A snapshot of ${business.name}. Live booking data will appear here once booking is enabled.`}
        action={<Badge variant="neutral">Preview data</Badge>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => {
          const Icon = icons[stat.icon as keyof typeof icons];
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <span className="grid size-9 place-items-center rounded-lg bg-brand-muted text-brand">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bookings over time</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Appointments throughout this week
                </p>
              </div>
              <Badge variant="neutral">Sample data</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label="Bar chart showing weekly bookings, highest on Saturday"
              className="flex h-56 items-end justify-between gap-2 border-b border-border pb-2 pt-6"
            >
              {data.chart.map((item) => (
                <div
                  key={item.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full max-w-12 rounded-t-md bg-brand/80 transition hover:bg-brand"
                    style={{ height: `${item.value}%` }}
                    title={`${item.label}: ${item.value} bookings`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming bookings</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your next appointments
                </p>
              </div>
              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                View all <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {data.bookings.map((booking) => (
              <div key={booking.id} className="flex min-w-0 items-center gap-3">
                <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                  {new Intl.DateTimeFormat('en-IN', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: business.timezone
                  }).format(new Date(booking.startsAt))}
                </span>
                <span
                  aria-hidden="true"
                  className="h-9 w-1 shrink-0 rounded-full bg-brand/60"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {booking.customer}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {booking.service}
                  </p>
                </div>
                <Badge
                  variant={
                    booking.status === 'confirmed' ? 'success' : 'warning'
                  }
                  className="capitalize"
                >
                  {booking.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Keep your business details up to date.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/services"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
          >
            Manage services
          </Link>
          <Link
            href="/dashboard/staff"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
          >
            Manage your team
          </Link>
          <Link
            href="/dashboard/settings"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
          >
            Business settings
          </Link>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Dashboard metrics and bookings are illustrative placeholders; live
        reporting will be connected in a later step.
      </p>
    </section>
  );
}
