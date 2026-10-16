# Slotly Progress

- [x] Setup
- [x] Data model
- [x] Services and availability
- [ ] Slot generation
- [ ] Double-booking prevention
- [ ] Payments
- [ ] Roles and plan limits
- [ ] Dashboards and notifications
- [ ] Polish and deploy

## Frontend delivery

- [x] Shared UI foundation and responsive design tokens
- [x] Marketing homepage and pricing page
- [x] Branded authentication and three-step onboarding wizard
- [x] Dashboard overview, bookings, calendar, customer, service, staff, and settings UI
- [x] Public booking flow preview and platform admin preview
- [x] Error, loading, empty, and not-found states
- [ ] Replace preview data with real booking, availability, customer, and analytics queries
- [ ] Implement booking writes, deposit payments, notification delivery, and platform admin data
- [ ] Final production polish and deployment

Booking, availability, customer, dashboard metric, and platform admin examples are
UI placeholders only. The public booking confirmation does not create a booking
or charge a payment method.

## Repository layout

- [x] Group the Next.js app, UI, browser-safe helpers, and static assets under `frontend/`
- [x] Group server actions, Supabase migrations/tests, and Stripe server code under `backend/`
- [x] Keep root package management and route all app/database scripts to the new locations
