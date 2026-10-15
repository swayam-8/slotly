# Slotly Architecture

## Overview

Slotly is a multi-tenant booking SaaS built with Next.js, TypeScript, Supabase,
Stripe, and Tailwind CSS. Businesses will configure services, staff, and working
hours. Customers will book available time slots and pay a deposit through Stripe.

The current application is the Next.js Subscription Payments starter: it provides
Supabase authentication and Stripe subscription billing. Slotly's owner dashboard
now manages services, staff, recurring working hours, time off, and business
settings. Booking, slot generation, and deposit-payment operations have not been
implemented. The initial Slotly tenant, service, staff, working-hours, time-off,
customer, and booking tables are defined in migrations; existing files and
conventions are retained as the product grows.

This project is built on top of
[vercel/nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments).

## Planned folder structure

Existing `app/`, `components/`, `utils/`, and `supabase/` folders remain in place.
The current Step 3 management paths are:

```text
app/dashboard/
├── page.tsx                            # Overview placeholder
├── services/page.tsx                   # Service management
├── staff/page.tsx                      # Staff management
├── staff/[id]/hours/page.tsx           # Weekly working-hours editor
├── staff/[id]/time-off/page.tsx        # Time-off management
└── settings/page.tsx                   # Business name and timezone

components/dashboard/                   # Dashboard shell, shared context, and management UI
utils/dashboard/                        # Authenticated actions, validation, money, and timezone helpers
supabase/migrations/                    # Versioned schema and atomic dashboard operations
supabase/tests/                         # RLS regression tests
```

The tree below shows future additions; route groups organize routes without
changing their public URLs.

```text
app/
├── onboarding/page.tsx                 # Create the first business for a user
├── (public)/
│   └── [businessSlug]/
│       ├── page.tsx                    # Public business page and service selection
│       └── book/page.tsx               # Customer booking flow
├── (dashboard)/
│   └── businesses/[businessId]/
│       ├── page.tsx                    # Business dashboard
│       ├── services/page.tsx           # Manage services
│       ├── staff/page.tsx              # Manage staff
│       ├── hours/page.tsx              # Manage working hours
│       ├── bookings/page.tsx           # View and manage bookings
│       ├── customers/page.tsx          # View business customers
│       └── settings/page.tsx           # Business, roles, and plan settings
└── api/
    ├── availability/route.ts           # Return available slots
    ├── bookings/route.ts               # Create and manage bookings
    └── webhooks/route.ts               # Existing Stripe webhook; extend for deposits

components/
├── booking/                            # Customer booking and slot-selection UI
├── ui/Onboarding/                      # First-business setup form
├── businesses/                         # Business profile and setup UI
├── services/                           # Service management UI
├── staff/                              # Staff and staff-service UI
├── customers/                          # Business customer UI
├── dashboard/                          # Shared business dashboard UI
└── notifications/                      # In-app notification UI

utils/
├── businesses/                         # Membership lookup and onboarding validation/actions
├── availability/                       # Availability and slot-generation logic
├── payments/                           # Booking deposits and Stripe operations
├── permissions/                        # Tenant membership and permission checks
└── notifications/                      # Notification delivery helpers

supabase/
└── migrations/                         # Versioned schema changes (existing convention)
```

- `app/(public)/[businessSlug]/` will hold tenant-facing pages addressed by a
  business's public slug.
- `app/(dashboard)/businesses/[businessId]/` will group authenticated,
  tenant-scoped management pages while keeping their URLs readable.
- `app/api/availability/` and `app/api/bookings/` will expose server-validated
  availability and booking operations.
- `app/api/webhooks/` already processes Stripe billing events; it will be extended
  for deposit/payment events rather than replaced.
- Each new `components/` subfolder separates feature UI in the same style as the
  existing component library.
- `utils/availability/` will calculate slots from working hours, exceptions, and
  existing bookings. Slots are derived, not stored as permanent records.
- `utils/businesses/` contains the onboarding checks and the membership lookup
  used to route new and returning users.
- `utils/payments/`, `utils/permissions/`, and `utils/notifications/` will keep
  those server-side concerns distinct from UI and route handlers.
- `supabase/migrations/` will continue to be the source of truth for schema
  changes.

## Database tables

The initial Slotly data-model migration creates the tables marked **Step 2**.
Other tables remain planned.

| Table                | Purpose                                                                           | Status           |
| -------------------- | --------------------------------------------------------------------------------- | ---------------- |
| `businesses`         | Tenant/business profile, public slug, and settings.                               | Step 2           |
| `business_members`   | Links authenticated users to businesses and their membership role.                | Step 2           |
| `services`           | Services offered by a business, including duration and deposit settings.          | Step 2           |
| `staff`              | Staff profiles belonging to a business.                                           | Step 2           |
| `working_hours`      | Recurring weekly availability for a staff member.                                 | Step 2           |
| `time_off`           | Dated unavailable periods for a staff member.                                     | Step 2           |
| `customers`          | Customer details scoped to the business where they book.                          | Step 2           |
| `bookings`           | Reserved service, staff, customer, time range, and booking status.                | Step 2           |
| `stripe_customers`   | Existing starter mapping between auth users and Stripe customers.                 | Existing billing |
| `business_directory` | Public-safe view of a business's id, name, slug, and timezone.                    | Step 3           |
| `staff_services`     | Services each staff member is qualified to provide.                               | Planned          |
| `payments`           | Stripe payment/deposit identifiers, amount, currency, and payment status.         | Planned          |
| `notifications`      | Persistent notification/outbox records and delivery state.                        | Planned          |
| `roles`              | Business-specific role definitions if built-in membership roles are insufficient. | Planned          |
| `role_permissions`   | Permission grants associated with configurable roles.                             | Planned          |

Availability slots will be calculated from working hours, time off, and bookings
rather than stored in a separate slots table. The existing Stripe
`stripe_customers`, `products`, `prices`, and `subscriptions` tables are part of
the starter's platform billing and may be adapted for business-level plan limits
as that requirement is implemented.

Working-hour values are recurring local times interpreted in the business
timezone. Time-off periods are stored as UTC `timestamptz` instants. The dashboard
replaces a staff member's full weekly schedule with one authenticated database
RPC call; RLS policies remain the authorization boundary for data access.

Regenerate the TypeScript database types after applying local migrations with
`pnpm supabase:generate-types`. This runs
`npx supabase gen types typescript --local --schema public > types_db.ts`.

Run dashboard utility tests with
`node --experimental-strip-types --test utils/dashboard/dashboard.test.mjs`.
The SQL RLS tests run with `npx supabase test db` against a running local
Supabase stack.
