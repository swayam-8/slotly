'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, CreditCard } from 'lucide-react';
import { createStripePortal } from '@backend/stripe/server';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/primitives';
import type { Tables } from '@/types_db';

type Subscription = Tables<'subscriptions'>;
type Price = Tables<'prices'>;
type Product = Tables<'products'>;
type SubscriptionWithPriceAndProduct = Subscription & {
  prices: (Price & { products: Product | null }) | null;
};

export default function CustomerPortalForm({
  subscription
}: {
  subscription: SubscriptionWithPriceAndProduct | null;
}) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subscriptionPrice =
    subscription?.prices?.unit_amount == null
      ? null
      : new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: subscription.prices.currency ?? 'INR',
          maximumFractionDigits: 0
        }).format(subscription.prices.unit_amount / 100);

  async function openPortal() {
    setIsSubmitting(true);
    try {
      const redirectUrl = await createStripePortal(currentPath);
      router.push(redirectUrl);
    } catch (error) {
      console.error('Could not open the Stripe billing portal:', error);
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan & billing</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your Slotly subscription and usage.
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-surface-muted p-4">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="mt-1 text-lg font-semibold">
              {subscription?.prices?.products?.name ?? 'Free'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {subscriptionPrice
                ? `${subscriptionPrice} / ${subscription?.prices?.interval ?? 'month'}`
                : 'No subscription payment required'}
            </p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-brand-muted text-brand">
            <CreditCard aria-hidden="true" className="size-5" />
          </span>
        </div>
        <div>
          {/* TODO(step-8): Load monthly usage and limits from tenant plan records. */}
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">Bookings this month</span>
            <span className="text-muted-foreground">12 / 20</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-3/5 rounded-full bg-brand" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Sample usage for the plan preview. Actual booking limits will be
            connected later.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {subscription ? (
            <Button loading={isSubmitting} onClick={() => void openPortal()}>
              Open billing portal{' '}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Button>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground hover:brightness-95"
            >
              Explore plans{' '}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          )}
          {!subscription && (
            <span className="self-center text-xs text-muted-foreground">
              Upgrade checkout uses your configured Stripe plans.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
