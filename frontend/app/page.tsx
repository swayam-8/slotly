import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  Clock3,
  Link2,
  UsersRound
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

const features = [
  {
    icon: CalendarCheck2,
    title: 'A calendar that stays clear',
    text: 'Keep appointments, team availability, and time off in one easy-to-read place.'
  },
  {
    icon: Clock3,
    title: 'Hours that work for you',
    text: 'Set weekly hours for every team member, including breaks and days away.'
  },
  {
    icon: UsersRound,
    title: 'Your team, in sync',
    text: 'Give your team the right access and keep your business information organized.'
  },
  {
    icon: Link2,
    title: 'A page that represents you',
    text: 'Keep your business details and service information together in one considered profile.'
  }
];

const steps = [
  [
    '01',
    'Set up your business',
    'Add your services, team, and the hours you are available.'
  ],
  [
    '02',
    'Set your team up',
    'Give each team member a clear profile and a schedule that fits their week.'
  ],
  [
    '03',
    'Get ready to welcome clients',
    'Review your business page and make sure the details feel like you.'
  ]
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-brand"
                />
                Scheduling for service businesses
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.5rem]">
                Appointments, without the admin.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Set up your services, organize team hours, and keep your
                business details in one considered workspace. Made for salons,
                clinics, tutors, and independent professionals.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signin/signup"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground transition hover:brightness-95"
                >
                  Create your workspace{' '}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                >
                  View plans
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free to set up · No card required
              </p>
            </div>
            <div
              className="mx-auto w-full max-w-xl lg:max-w-none"
              aria-label="Illustrative preview of a Slotly schedule"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-brand text-brand-foreground">
                      <CalendarCheck2 aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Studio Bloom</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Sample workspace
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground">
                    Today · 16 Oct
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold">
                      Today&apos;s schedule
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A quick look at the day ahead
                    </p>
                  </div>
                  <span className="rounded-md bg-brand-muted px-2.5 py-1.5 text-xs font-medium text-brand">
                    8 appointments
                  </span>
                </div>
                <div className="divide-y divide-border px-5">
                  <p className="py-3 text-xs font-medium text-muted-foreground">
                    NEXT UP
                  </p>
                  {[
                    {
                      time: '09:30',
                      name: 'Aarav Mehta',
                      service: 'Signature haircut',
                      color: 'bg-brand'
                    },
                    {
                      time: '10:45',
                      name: 'Priya Shah',
                      service: 'Consultation · 45 min',
                      color: 'bg-success'
                    },
                    {
                      time: '12:00',
                      name: 'Rohan Kapoor',
                      service: 'Color & refresh',
                      color: 'bg-warning'
                    }
                  ].map((booking) => (
                    <div
                      key={booking.time}
                      className="flex items-center gap-3 py-3.5"
                    >
                      <span className="w-12 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                        {booking.time}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-9 w-0.5 shrink-0 rounded-full ${booking.color}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {booking.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {booking.service}
                        </p>
                      </div>
                      <span className="hidden rounded-full bg-success-muted px-2.5 py-1 text-xs font-medium text-success sm:block">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border bg-surface px-5 py-3 text-xs text-muted-foreground">
                  Illustrative schedule · Sample data
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your day, a little more organized.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start with the parts that matter: what you offer, who is on your
              team, and when they work.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(([number, title, text]) => (
              <article
                key={number}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <span className="text-sm font-semibold text-brand">
                  {number}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="features"
          className="border-y border-border bg-surface-muted/60"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                Made for your kind of business
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                The essentials, thoughtfully together.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-muted text-brand">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                Straightforward plans
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start simply. Grow at your pace.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Get your business set up on the free plan. When you need more,
                choose a plan that fits your team.
              </p>
              <Link
                href="/pricing"
                className="mt-6 inline-flex items-center gap-2 font-medium text-brand hover:underline"
              >
                See all plans{' '}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Free
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  ₹0
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}
                    / month
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Everything to get started.
                </p>
                <ul className="mt-5 grid gap-3 text-sm">
                  {[
                    'One business profile',
                    'Services and team setup',
                    'Weekly working hours'
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check
                        aria-hidden="true"
                        className="size-4 text-success"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-brand/40 bg-brand-muted/40 p-6">
                <p className="text-sm font-medium text-brand">
                  Pro · coming soon
                </p>
                <p className="mt-3 text-3xl font-semibold">For growing teams</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  More flexibility as your business grows.
                </p>
                <ul className="mt-5 grid gap-3 text-sm">
                  {[
                    'More team capacity',
                    'Customer reminders',
                    'Advanced business tools'
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check aria-hidden="true" className="size-4 text-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="border-t border-border bg-surface-muted/60"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                Good to know
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                A few common questions
              </h2>
            </div>
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface px-5">
              {[
                [
                  'Who is Slotly for?',
                  'Slotly is designed for service businesses such as salons, clinics, tutors, and independent professionals.'
                ],
                [
                  'Can I manage more than one team member?',
                  'Yes. You can create staff profiles and set working hours for each team member.'
                ],
                [
                  'Can customers pay a deposit?',
                  'Deposit amounts can be configured for your services. Online booking and payment collection are on the product roadmap.'
                ],
                [
                  'Can I change my business timezone?',
                  'Yes. Your business timezone is configurable in settings and determines how weekly hours are interpreted.'
                ]
              ].map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {question}
                    <span
                      aria-hidden="true"
                      className="float-right text-brand transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center sm:px-12 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              A more organized start
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Get your business set up with clarity.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Add your services, define team hours, and build a solid foundation
              for what comes next.
            </p>
            <Link
              href="/signin/signup"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground transition hover:brightness-95"
            >
              Create your workspace{' '}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
