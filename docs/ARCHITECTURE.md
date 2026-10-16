# Slotly Architecture

## Overview

Slotly is a multi-tenant booking SaaS for service businesses, built with
Next.js, TypeScript, Supabase, Stripe, and Tailwind CSS. Businesses manage
services, staff, working hours, and time off. Customers will browse availability,
book appointments, and pay deposits when booking support is implemented.

The application builds on
[vercel/nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments),
reusing its Supabase authentication and Stripe subscription billing foundation.
Booking persistence, slot generation, deposit payments, and live analytics are
not implemented yet. Public booking and dashboard metrics are UI previews.

## Repository layout

The package manager, lockfile, and shared documentation stay at the repository
root. Package scripts run Next.js from `frontend/` and Supabase CLI commands from
`backend/supabase/`.

```text
frontend/
├── app/                         # Next.js App Router pages and API routes
├── components/
│   ├── booking/                 # Customer-facing booking flow
│   ├── dashboard/               # Dashboard shell and feature views
│   └── ui/                      # Shared controls, auth, marketing, onboarding
├── public/                      # Static assets and generated Open Graph images
├── styles/                      # Global styles and design tokens
├── utils/
│   ├── dashboard/               # Browser-safe formatting and timezone helpers
│   ├── placeholders/            # Typed sample data with TODO(step-N) markers
│   └── supabase/client.ts       # Browser-side Supabase client
├── types_db.ts                  # Generated Supabase database types
├── middleware.ts                # Session refresh/request middleware
└── next.config.js               # Next.js configuration, including backend source access

backend/
├── auth/                        # Server-side authentication actions
├── businesses/                  # Business membership, onboarding, and validation
├── dashboard/                   # Authorized service/staff/settings actions
├── lib/supabase/                # Server-side Supabase clients and queries
├── stripe/                      # Stripe server configuration and actions
├── fixtures/                    # Stripe CLI test fixtures
├── schema.sql                   # Starter schema
└── supabase/
    ├── config.toml              # Supabase local development configuration
    ├── migrations/              # Versioned schema and database operations
    ├── tests/                   # SQL RLS regression tests
    └── seed.sql                 # Local seed data

docs/
├── ARCHITECTURE.md
└── PROGRESS.md
```

### Frontend design system and placeholders

The single brand accent is indigo (`#4F46E5`). Neutral surfaces, borders, status
colors, and focus rings use CSS variables in `frontend/styles/main.css`, mapped
in `frontend/tailwind.config.js`. Light and dark themes share those tokens. The
UI uses the existing Inter/system sans-serif stack, consistent spacing, visible
keyboard focus, and responsive layouts. No frontend dependency was added.

Dashboard metrics, bookings, customers, public demo availability, and platform
admin lists are typed preview data in `frontend/utils/placeholders/`. Their data
access functions are labeled `TODO(step-N)`. Booking actions only change local
UI state; the public confirmation does not persist a booking or collect payment.
The homepage schedule illustration and dashboard metrics are explicitly marked
as sample/preview data. The `/b/studio-bloom` route is sample content for review.

## Current feature paths

```text
frontend/app/
├── page.tsx                     # Marketing homepage
├── pricing/page.tsx             # Stripe-backed subscription pricing
├── signin/[id]/page.tsx         # Authentication flows
├── onboarding/page.tsx          # Business setup wizard
├── dashboard/
│   ├── page.tsx                 # Overview preview
│   ├── bookings/                # Booking list preview
│   ├── calendar/                # Schedule preview
│   ├── customers/               # Customer list preview
│   ├── services/                # Service management
│   ├── staff/                   # Staff, working hours, and time off
│   └── settings/                # Business settings and billing
├── b/[slug]/                    # Public business booking preview
└── admin/                       # Platform-admin preview

backend/
├── auth/                        # Auth actions used by frontend server components
├── businesses/                  # Membership checks and onboarding actions
├── dashboard/                   # Server actions and role authorization
├── lib/supabase/                # Server clients, queries, and middleware refresh
├── stripe/                      # Checkout, portal, and Stripe server configuration
└── supabase/                    # Migrations and RLS tests
```

Future availability, booking, payment, role, and notification logic belongs in
`backend/availability/`, `backend/bookings/`, `backend/payments/`,
`backend/permissions/`, and `backend/notifications/`. Tenant-facing UI belongs
in feature folders under `frontend/components/`; its public URLs and authenticated
dashboard routes remain under `frontend/app/`. Availability is derived from
working hours, time off, and bookings rather than stored as slot rows.

## Planned database tables

| Table                                 | Purpose                                               | Status   |
| ------------------------------------- | ----------------------------------------------------- | -------- |
| `businesses`                          | Tenant profile, public slug, and settings             | Step 2   |
| `business_members`                    | Users' business membership and role                   | Step 2   |
| `services`                            | Business offerings, duration, price, and deposit      | Step 2   |
| `staff`                               | Staff profile belonging to a business                 | Step 2   |
| `working_hours`                       | Staff's recurring weekly local-time availability      | Step 2   |
| `time_off`                            | Staff's dated unavailable periods                     | Step 2   |
| `customers`                           | Customer contact details scoped to a business         | Step 2   |
| `bookings`                            | Service, staff, customer, time range, and status      | Step 2   |
| `stripe_customers`                    | Existing auth-user to Stripe-customer mapping         | Existing |
| `products`, `prices`, `subscriptions` | Existing Stripe subscription billing data             | Existing |
| `business_directory`                  | Public-safe business id, name, slug, and timezone     | Step 3   |
| `staff_services`                      | Services each staff member can provide                | Planned  |
| `payments`                            | Booking deposit amount, Stripe id, and payment status | Planned  |
| `notifications`                       | Notification/outbox records and delivery state        | Planned  |
| `roles`, `role_permissions`           | Optional configurable role permissions                | Planned  |

Working hours are recurring local clock times interpreted in the business
timezone. Time off and booking instants use UTC `timestamptz`. A database
exclusion constraint for overlapping bookings is intentionally deferred to
Step 5.

## Database development

`backend/supabase/migrations/` is the source of truth for schema changes. Local
Supabase CLI state is ignored and must not be committed. Start/reset/test the
local stack with the root scripts:

```bash
pnpm supabase:start
pnpm supabase:reset
npx supabase --workdir backend/supabase test db
```

Regenerate TypeScript database types after applying migrations locally:

```bash
pnpm supabase:generate-types
```

This runs
`npx supabase --workdir backend/supabase gen types typescript --local --schema public > frontend/types_db.ts`.
Run browser-safe dashboard utility tests with:

```bash
node --experimental-strip-types --test frontend/utils/dashboard/dashboard.test.mjs
```
