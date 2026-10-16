'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input
} from '@/components/ui/primitives';
import type { PublicBookingProfile } from '@/utils/placeholders/dashboard';

const money = (cents: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(cents / 100);
const steps = ['Service', 'Time', 'Details', 'Review'];

export default function PublicBookingFlow({
  business,
  slotOptions
}: {
  business: PublicBookingProfile;
  slotOptions: string[];
}) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('any');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [confirmed, setConfirmed] = useState(false);
  const service = business.services.find((item) => item.id === serviceId);
  const staff = business.staff.find((item) => item.id === staffId);
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const selectableDates = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(base);
      day.setDate(base.getDate() + index + 1);
      return {
        value: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
        day: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day),
        date: new Intl.DateTimeFormat('en', {
          day: 'numeric',
          month: 'short'
        }).format(day)
      };
    });
  }, []);

  function selectDate(value: string) {
    setDate(value);
    setTime('');
    setIsLoadingSlots(true);
    window.setTimeout(() => setIsLoadingSlots(false), 350);
  }

  function continueStep() {
    if (step < steps.length - 1) setStep((current) => current + 1);
  }

  if (confirmed) {
    return (
      <main className="mx-auto grid min-h-[75dvh] max-w-2xl place-items-center px-5 py-12">
        <Card className="w-full">
          <CardContent className="grid justify-items-center p-8 text-center sm:p-12">
            <span className="grid size-16 place-items-center rounded-full bg-success-muted text-success">
              <Check aria-hidden="true" className="size-8" />
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-success">
              Request received
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              You&apos;re on the calendar.
            </h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              This is a booking preview. Your appointment request has not been
              sent to {business.name} yet.
            </p>
            <div className="mt-7 w-full rounded-xl bg-surface-muted p-5 text-left">
              <p className="font-semibold">{service?.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {date} · {time} ({business.timezone})
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {customer.name} ·{' '}
                {staff?.displayName ?? 'Any available team member'}
              </p>
            </div>
            <Button
              className="mt-6"
              variant="outline"
              disabled
              title="Calendar export will be available with real bookings."
            >
              <CalendarDays aria-hidden="true" className="size-4" />
              Add to calendar
            </Button>
            <Link
              href="/"
              className="mt-1 text-sm font-medium text-brand hover:underline"
            >
              Back to Slotly
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const canContinue =
    step === 0
      ? Boolean(serviceId)
      : step === 1
        ? Boolean(date && time)
        : step === 2
          ? Boolean(
              customer.name.trim() &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
            )
          : true;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-7 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
            <CalendarDays aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">
              {business.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {business.description}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5" /> All times in{' '}
              {business.timezone}
            </p>
          </div>
        </div>
        <Badge variant="neutral">Booking preview</Badge>
      </header>
      <div
        className="mb-7 grid grid-cols-4 gap-2"
        aria-label="Booking progress"
      >
        {steps.map((label, index) => (
          <div key={label} className="grid gap-2">
            <div
              className={`h-1 rounded-full ${index <= step ? 'bg-brand' : 'bg-border'}`}
            />
            <span
              className={`text-xs ${index === step ? 'font-semibold text-brand' : 'text-muted-foreground'}`}
            >
              {index + 1}. {label}
            </span>
          </div>
        ))}
      </div>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          {step === 0 && (
            <div className="grid gap-7">
              <div>
                <h2 className="text-xl font-semibold">Choose a service</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select what you would like to book.
                </p>
              </div>
              <div className="grid gap-3">
                {business.services.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={serviceId === item.id}
                    onClick={() => setServiceId(item.id)}
                    className={`rounded-2xl border bg-surface p-4 text-left transition sm:p-5 ${serviceId === item.id ? 'border-brand ring-2 ring-brand/20' : 'border-border hover:border-brand/40'}`}
                  >
                    <span className="flex flex-wrap items-start justify-between gap-3">
                      <span>
                        <span className="block font-semibold">{item.name}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {item.description}
                        </span>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          {item.durationMinutes} minutes ·{' '}
                          {money(item.depositCents)} deposit
                        </span>
                      </span>
                      <span className="text-right font-semibold">
                        {money(item.priceCents)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Choose a team member</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Or let us find someone for you.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={staffId === 'any'}
                    onClick={() => setStaffId('any')}
                    className={`rounded-full border px-4 py-2 text-sm ${staffId === 'any' ? 'border-brand bg-brand-muted text-brand' : 'border-border hover:bg-surface-muted'}`}
                  >
                    Any available
                  </button>
                  {business.staff.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      aria-pressed={staffId === member.id}
                      onClick={() => setStaffId(member.id)}
                      className={`rounded-full border px-4 py-2 text-sm ${staffId === member.id ? 'border-brand bg-brand-muted text-brand' : 'border-border hover:bg-surface-muted'}`}
                    >
                      {member.displayName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-7">
              <div>
                <h2 className="text-xl font-semibold">Pick a date and time</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose from the sample availability shown below.
                </p>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Available dates</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
                  {selectableDates.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={date === item.value}
                      onClick={() => selectDate(item.value)}
                      className={`grid min-h-16 place-items-center rounded-xl border px-2 py-2 text-center ${date === item.value ? 'border-brand bg-brand-muted text-brand' : 'border-border hover:bg-surface-muted'}`}
                    >
                      <span className="text-xs">{item.day}</span>
                      <span className="text-sm font-semibold">{item.date}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Clock3 aria-hidden="true" className="size-4 text-brand" />
                  Available times · {business.timezone}
                </p>
                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                      Checking available times…
                    </div>
                  </div>
                ) : date && slotOptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-surface-muted px-4 py-8 text-center">
                    <p className="font-medium">No slots available this day</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose another date to see more times.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slotOptions.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        disabled={!date}
                        aria-pressed={time === slot}
                        onClick={() => setTime(slot)}
                        className={`min-h-11 rounded-lg border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${time === slot ? 'border-brand bg-brand text-brand-foreground' : 'border-border hover:border-brand hover:bg-brand-muted'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                {!date && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Choose a date to see available times.
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Times displayed in the business timezone ({business.timezone}
                  ); your device timezone is {localTimeZone}.
                </p>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-6">
              <div>
                <h2 className="text-xl font-semibold">Your details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Who should we expect?
                </p>
              </div>
              <Input
                label="Full name"
                autoComplete="name"
                required
                value={customer.name}
                onChange={(event) =>
                  setCustomer({ ...customer, name: event.target.value })
                }
              />
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                required
                error={
                  customer.email &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
                    ? 'Enter a valid email address.'
                    : undefined
                }
                value={customer.email}
                onChange={(event) =>
                  setCustomer({ ...customer, email: event.target.value })
                }
              />
              <Input
                label="Phone number"
                type="tel"
                autoComplete="tel"
                value={customer.phone}
                onChange={(event) =>
                  setCustomer({ ...customer, phone: event.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Your details are only shown here for the booking preview; they
                are not submitted.
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Review your appointment
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Take a moment to check the details.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Appointment summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-right font-medium">
                      {service?.name}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Team member</span>
                    <span className="text-right font-medium">
                      {staff?.displayName ?? 'Any available'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Date & time</span>
                    <span className="text-right font-medium">
                      {date} · {time} ({business.timezone})
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Your name</span>
                    <span className="text-right font-medium">
                      {customer.name}
                    </span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Service price
                      </span>
                      <span>{money(service?.priceCents ?? 0)}</span>
                    </div>
                    <div className="mt-2 flex justify-between font-semibold">
                      <span>Deposit due</span>
                      <span>{money(service?.depositCents ?? 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-2 rounded-xl bg-warning-muted p-4 text-sm text-warning">
                <ShieldCheck aria-hidden="true" className="size-5 shrink-0" />
                This is a visual preview. No appointment or payment will be
                created.
              </div>
            </div>
          )}
          <div className="mt-8 hidden justify-between border-t border-border pt-5 sm:flex">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back
            </Button>
            {step < 3 ? (
              <Button disabled={!canContinue} onClick={continueStep}>
                Continue <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button onClick={() => setConfirmed(true)}>
                Confirm preview <Check aria-hidden="true" className="size-4" />
              </Button>
            )}
          </div>
        </section>
        <aside className="hidden lg:block">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Your appointment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              {service ? (
                <>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="mt-1 text-muted-foreground">
                      {service.durationMinutes} minutes
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span>{money(service.priceCents)}</span>
                    </div>
                    <div className="mt-2 flex justify-between font-medium">
                      <span>Deposit</span>
                      <span>{money(service.depositCents)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Choose a service to see your summary.
                </p>
              )}
              {date && time && (
                <p className="flex gap-2 border-t border-border pt-4 text-muted-foreground">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-4 shrink-0 text-brand"
                  />
                  {date} at {time}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {business.timezone}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface p-3 shadow-lg sm:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {service
                ? `${service.name} · ${money(service.priceCents)}`
                : 'Choose a service'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {date && time
                ? `${date} · ${time} (${business.timezone})`
                : 'Your appointment summary'}
            </p>
          </div>
          {step < 3 ? (
            <Button size="sm" disabled={!canContinue} onClick={continueStep}>
              Continue
            </Button>
          ) : (
            <Button size="sm" onClick={() => setConfirmed(true)}>
              Confirm
            </Button>
          )}
        </div>
      </div>
      <div className="h-20 sm:hidden" />
    </main>
  );
}
