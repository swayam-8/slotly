# Slotly

Slotly is a multi-tenant booking SaaS for salons, clinics, tutors, and other
service businesses. It is built with Next.js, TypeScript, Supabase, Stripe, and
Tailwind CSS, based on
[vercel/nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments).

## Project layout

- `frontend/` contains the Next.js App Router app, components, styles, and
  browser-safe utilities.
- `backend/` contains server actions, Stripe/Supabase server integrations, and
  Supabase migrations, seeds, and RLS tests.
- `docs/` contains the architecture and implementation progress.
- `package.json` and the lockfile stay at the repository root; package scripts
  target the correct frontend or backend folder.

## Run locally

1. Install Node.js and pnpm, then run `pnpm install` at the repository root.
2. Copy `frontend/.env.local.example` to `frontend/.env.local`.
3. Add your Supabase project URL and publishable/anon key, and Stripe test
   publishable/secret keys. Set the Stripe webhook secret if testing webhooks.
   Keep service-role and secret keys server-side; never commit environment files.
4. Run `pnpm dev` and open [http://localhost:3000](http://localhost:3000).

## Enable Google sign-in

The sign-in and sign-up screens use Google OAuth through Supabase.

1. Create an OAuth 2.0 Web client in Google Cloud Console.
2. Add your Supabase project's callback URL to Google's **Authorized redirect
   URIs**: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. In Supabase Dashboard, open **Authentication → Sign In / Providers → Google**,
   enable Google, and enter the Google client ID and client secret.
4. In Supabase **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/callback` to the redirect allow list. Add your
   deployed site's `/auth/callback` URL when deploying.

For local Supabase, copy `backend/supabase/.env.example` to
`backend/supabase/.env`, fill in your Google OAuth client values, then run
`pnpm supabase:restart`. The local Supabase provider uses the callback URL
`http://127.0.0.1:54321/auth/v1/callback`.

The app can connect to a hosted Supabase project, or you can run the local
Supabase stack with Docker using `pnpm supabase:start`. The Supabase CLI
configuration, migrations, and tests live in `backend/supabase/`. Use
`pnpm supabase:status` for local service URLs and `pnpm supabase:reset` to reset
the local database.

## Useful commands

| Command                                                                              | Description                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `pnpm dev`                                                                           | Start the frontend with the Next.js development server  |
| `pnpm build`                                                                         | Build the frontend for production                       |
| `pnpm start`                                                                         | Serve the production build                              |
| `pnpm supabase:start`                                                                | Start local Supabase services                           |
| `pnpm supabase:generate-types`                                                       | Regenerate `frontend/types_db.ts` from the local schema |
| `pnpm supabase:push`                                                                 | Apply pending migrations to the linked Supabase project |
| `node --experimental-strip-types --test frontend/utils/dashboard/dashboard.test.mjs` | Run dashboard utility tests                             |

The marketing site and dashboard previews are implemented. Public booking
availability, booking persistence, deposits, and live analytics remain planned;
the public booking route is a non-persisting preview.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the architecture,
planned data model, and UI placeholder boundaries, and
[docs/PROGRESS.md](./docs/PROGRESS.md) for phase status.
