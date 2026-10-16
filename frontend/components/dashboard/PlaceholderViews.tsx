'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  UserRound,
  X
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/primitives';
import type {
  PlaceholderBooking,
  PlaceholderCustomer,
  BookingStatus
} from '@/utils/placeholders/dashboard';

type View = 'bookings' | 'calendar' | 'customers';

const badgeVariant: Record<
  BookingStatus,
  'warning' | 'success' | 'neutral' | 'danger'
> = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'neutral',
  cancelled: 'danger',
  no_show: 'danger'
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount / 100);
const formatDate = (value: string, timezone = 'Asia/Kolkata') =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: timezone
  }).format(new Date(value));
const formatTime = (value: string, timezone = 'Asia/Kolkata') =>
  new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone
  }).format(new Date(value));

export default function PlaceholderViews({
  view,
  bookings: initialBookings,
  customers
}: {
  view: View;
  bookings: PlaceholderBooking[];
  customers: PlaceholderCustomer[];
}) {
  const { business } = useDashboard();
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [selectedBooking, setSelectedBooking] =
    useState<PlaceholderBooking | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<PlaceholderCustomer | null>(null);
  const [calendarMode, setCalendarMode] = useState<'week' | 'day'>('week');
  const [offset, setOffset] = useState(0);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const matchesText =
          `${booking.customer} ${booking.service} ${booking.staff} ${booking.id}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const date = booking.startsAt.slice(0, 10);
        return (
          matchesText &&
          (status === 'all' || booking.status === status) &&
          (staffFilter === 'all' || booking.staff === staffFilter) &&
          (!fromDate || date >= fromDate) &&
          (!toDate || date <= toDate)
        );
      }),
    [bookings, fromDate, query, staffFilter, status, toDate]
  );
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const visibleBookings = filteredBookings.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name} ${customer.email} ${customer.phone}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [customers, query]
  );

  function updateStatus(nextStatus: BookingStatus) {
    if (!selectedBooking) return;
    setBookings((current) =>
      current.map((item) =>
        item.id === selectedBooking.id ? { ...item, status: nextStatus } : item
      )
    );
    setSelectedBooking({ ...selectedBooking, status: nextStatus });
  }

  if (view === 'customers') {
    return (
      <section className="grid gap-6">
        <PageHeader
          title="Customers"
          description="Get to know the people who keep your business going."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative max-w-md flex-1">
            <span className="sr-only">Search customers</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or phone"
              className="min-h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <Badge variant="neutral">{filteredCustomers.length} customers</Badge>
        </div>
        <Card>
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Last visit</TableHead>
                  <TableHead>Total spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <TableCell>
                      <span className="font-medium">{customer.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {customer.email}
                      </span>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.visits}</TableCell>
                    <TableCell>{customer.lastVisit}</TableCell>
                    <TableCell>
                      {formatMoney(customer.totalSpentCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid divide-y divide-border sm:hidden">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => setSelectedCustomer(customer)}
                className="grid gap-2 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="font-medium">{customer.name}</span>
                <span className="text-sm text-muted-foreground">
                  {customer.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {customer.visits} visits · {customer.lastVisit}
                </span>
              </button>
            ))}
          </div>
          {!filteredCustomers.length && (
            <div className="p-5">
              <EmptyState
                title="No customers found"
                description="Try a different search term."
              />
            </div>
          )}
        </Card>
        <Dialog
          open={Boolean(selectedCustomer)}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
          title={selectedCustomer?.name ?? 'Customer details'}
          description={selectedCustomer?.email}
          className="fixed inset-y-0 right-0 m-0 h-dvh max-h-dvh w-[min(92vw,28rem)] overflow-y-auto rounded-none rounded-l-2xl"
        >
          {selectedCustomer && (
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs text-muted-foreground">Visits</p>
                  <p className="mt-1 text-xl font-semibold">
                    {selectedCustomer.visits}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs text-muted-foreground">Total spent</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatMoney(selectedCustomer.totalSpentCents)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Recent visits</h3>
                <div className="mt-3 grid gap-2">
                  {bookings
                    .filter(
                      (booking) => booking.customer === selectedCustomer.name
                    )
                    .slice(0, 3)
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm"
                      >
                        <span>
                          <span className="block font-medium">
                            {booking.service}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(booking.startsAt, business.timezone)} ·{' '}
                            {booking.staff}
                          </span>
                        </span>
                        <Badge
                          variant={badgeVariant[booking.status]}
                          className="capitalize"
                        >
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  {!bookings.some(
                    (booking) => booking.customer === selectedCustomer.name
                  ) && (
                    <p className="text-sm text-muted-foreground">
                      No sample visit history available.
                    </p>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Last visit: {selectedCustomer.lastVisit}. Customer history is
                  sample data only.
                </p>
              </div>
            </div>
          )}
        </Dialog>
      </section>
    );
  }

  if (view === 'calendar') {
    const visible =
      offset === 0
        ? bookings
        : bookings.map((booking, index) => ({
            ...booking,
            startsAt: new Date(
              new Date(booking.startsAt).getTime() +
                offset * 7 * 86400000 +
                index * 3600000
            ).toISOString()
          }));
    const days = Array.from(
      new Set(
        visible.map((booking) =>
          formatDate(booking.startsAt, business.timezone)
        )
      )
    );
    const team = Array.from(new Set(visible.map((booking) => booking.staff)));
    const selectedDay = days[0];
    return (
      <section className="grid gap-6">
        <PageHeader
          title="Calendar"
          description="A quick view of your team's upcoming schedule."
          action={
            <div className="flex rounded-lg border border-border bg-surface-muted p-1">
              <Button
                size="sm"
                variant={calendarMode === 'week' ? 'outline' : 'ghost'}
                onClick={() => setCalendarMode('week')}
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={calendarMode === 'day' ? 'outline' : 'ghost'}
                onClick={() => setCalendarMode('day')}
              >
                Day
              </Button>
            </div>
          }
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Previous week"
              onClick={() => setOffset((value) => value - 1)}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Next week"
              onClick={() => setOffset((value) => value + 1)}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
            <span className="ml-2 text-sm font-medium">
              {offset === 0
                ? 'This week'
                : `${Math.abs(offset)} ${Math.abs(offset) === 1 ? 'week' : 'weeks'} ${offset < 0 ? 'ago' : 'ahead'}`}
            </span>
          </div>
          <Badge variant="neutral">Asia/Kolkata</Badge>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {team.map((member) => (
            <Card key={member} className="w-[18rem] min-w-[18rem]">
              <CardHeader>
                <CardTitle>{member}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {visible
                  .filter(
                    (booking) =>
                      booking.staff === member &&
                      (calendarMode === 'week' ||
                        formatDate(booking.startsAt, business.timezone) ===
                          selectedDay)
                  )
                  .sort((first, second) =>
                    first.startsAt.localeCompare(second.startsAt)
                  )
                  .map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className="rounded-xl border border-brand/20 bg-brand-muted/50 p-3 text-left transition hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatDate(booking.startsAt, business.timezone)}
                      </p>
                      <p className="text-xs font-medium text-brand">
                        {formatTime(booking.startsAt, business.timezone)} –{' '}
                        {formatTime(booking.endsAt, business.timezone)}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {booking.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.service} · {booking.staff}
                      </p>
                    </button>
                  ))}
                {!visible.some(
                  (booking) =>
                    booking.staff === member &&
                    (calendarMode === 'week' ||
                      formatDate(booking.startsAt, business.timezone) ===
                        selectedDay)
                ) && (
                  <p className="py-5 text-sm text-muted-foreground">
                    No appointments scheduled{' '}
                    {calendarMode === 'day' ? 'today' : 'this week'}.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <Dialog
          open={Boolean(selectedBooking)}
          onOpenChange={(open) => !open && setSelectedBooking(null)}
          title={selectedBooking?.customer ?? 'Booking details'}
          description={selectedBooking?.service}
          className="fixed inset-y-0 right-0 m-0 h-dvh max-h-dvh w-[min(92vw,28rem)] overflow-y-auto rounded-none rounded-l-2xl"
        >
          {selectedBooking && (
            <p className="text-sm text-muted-foreground">
              {formatDate(selectedBooking.startsAt, business.timezone)} ·{' '}
              {formatTime(selectedBooking.startsAt, business.timezone)} with{' '}
              {selectedBooking.staff}
            </p>
          )}
        </Dialog>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Bookings"
        description="Keep track of appointments and what comes next."
        action={
          <Button disabled title="Booking creation is planned for a later step">
            New booking
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
        <label className="relative sm:col-span-2 xl:col-span-1">
          <span className="sr-only">Search bookings</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search customer, service, or ID"
            className="min-h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(0);
          }}
        >
          <option value="all">All statuses</option>
          {['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map(
            (value) => (
              <option key={value} value={value}>
                {value.replace('_', ' ')}
              </option>
            )
          )}
        </Select>
        <Select
          label="Staff member"
          value={staffFilter}
          onChange={(event) => {
            setStaffFilter(event.target.value);
            setPage(0);
          }}
        >
          <option value="all">All team</option>
          {Array.from(new Set(bookings.map((booking) => booking.staff))).map(
            (name) => (
              <option key={name} value={name}>
                {name}
              </option>
            )
          )}
        </Select>
        <label className="grid gap-2 text-sm font-medium">
          From
          <input
            aria-label="From date"
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(0);
            }}
            className="min-h-11 rounded-lg border border-border bg-surface px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          To
          <input
            aria-label="To date"
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(0);
            }}
            className="min-h-11 rounded-lg border border-border bg-surface px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>
      <Card>
        <div className="hidden overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service & staff</TableHead>
                <TableHead>Date & time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <TableCell>
                    <span className="font-medium">{booking.customer}</span>
                    <span className="block text-xs text-muted-foreground">
                      {booking.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    {booking.service}
                    <span className="block text-xs text-muted-foreground">
                      {booking.staff}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDate(booking.startsAt, business.timezone)}
                    <span className="block text-xs text-muted-foreground">
                      {formatTime(booking.startsAt, business.timezone)}
                    </span>
                  </TableCell>
                  <TableCell>{formatMoney(booking.priceCents)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={badgeVariant[booking.status]}
                      className="capitalize"
                    >
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="grid divide-y divide-border sm:hidden">
          {visibleBookings.map((booking) => (
            <button
              key={booking.id}
              type="button"
              onClick={() => setSelectedBooking(booking)}
              className="grid gap-2 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span className="flex items-center justify-between gap-3 font-medium">
                {booking.customer}
                <Badge
                  variant={badgeVariant[booking.status]}
                  className="capitalize"
                >
                  {booking.status.replace('_', ' ')}
                </Badge>
              </span>
              <span className="text-sm text-muted-foreground">
                {booking.service} · {booking.staff}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(booking.startsAt, business.timezone)} at{' '}
                {formatTime(booking.startsAt, business.timezone)} ·{' '}
                {formatMoney(booking.priceCents)}
              </span>
            </button>
          ))}
        </div>
        {!filteredBookings.length && (
          <div className="p-5">
            <EmptyState
              title="No bookings match"
              description="Try changing the search or status filter."
            />
          </div>
        )}
        {filteredBookings.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {page * pageSize + 1}–
              {Math.min((page + 1) * pageSize, filteredBookings.length)} of{' '}
              {filteredBookings.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {pageCount}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
      <p className="text-xs text-muted-foreground">
        Sample bookings shown for layout preview. Booking records and analytics
        will connect in later steps.
      </p>
      <Dialog
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        title={selectedBooking?.customer ?? 'Booking details'}
        description={
          selectedBooking
            ? `${selectedBooking.id} · ${selectedBooking.service}`
            : undefined
        }
        className="fixed inset-y-0 right-0 m-0 h-dvh max-h-dvh w-[min(92vw,28rem)] overflow-y-auto rounded-none rounded-l-2xl"
      >
        {selectedBooking && (
          <div className="grid gap-5">
            <div className="grid gap-3 rounded-xl bg-surface-muted p-4 text-sm">
              <p className="flex items-center gap-2">
                <CalendarDays
                  aria-hidden="true"
                  className="size-4 text-brand"
                />
                {formatDate(selectedBooking.startsAt, business.timezone)}
              </p>
              <p className="flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4 text-brand" />
                {formatTime(selectedBooking.startsAt, business.timezone)} –{' '}
                {formatTime(selectedBooking.endsAt, business.timezone)}
              </p>
              <p className="flex items-center gap-2">
                <UserRound aria-hidden="true" className="size-4 text-brand" />
                {selectedBooking.staff}
              </p>
              <p>{selectedBooking.email}</p>
              <p className="font-medium">
                {formatMoney(selectedBooking.priceCents)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => updateStatus('confirmed')}>
                <Check aria-hidden="true" className="size-4" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus('completed')}
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus('no_show')}
              >
                No-show
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus('cancelled')}
              >
                <X aria-hidden="true" className="size-4" />
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Actions update this sample view only and are not saved.
            </p>
          </div>
        )}
      </Dialog>
    </section>
  );
}
