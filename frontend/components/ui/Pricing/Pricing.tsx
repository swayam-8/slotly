'use client';

import Button from '@/components/ui/Button';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@backend/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product.prices?.map((price) => price.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      setPriceIdLoading(undefined);
      router.push('/signin/signup');
      return;
    }
    try {
      const { errorRedirect, sessionId } = await checkoutWithStripe(
        price,
        currentPath
      );
      if (errorRedirect) {
        setPriceIdLoading(undefined);
        router.push(errorRedirect);
        return;
      }
      if (!sessionId) {
        setPriceIdLoading(undefined);
        router.push(
          getErrorRedirect(
            currentPath,
            'Unable to start checkout.',
            'Please try again later.'
          )
        );
        return;
      }
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe could not be initialized.');
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Stripe checkout could not be started:', error);
      setPriceIdLoading(undefined);
      router.push(
        getErrorRedirect(
          currentPath,
          'Unable to start checkout.',
          'Please try again later.'
        )
      );
    }
  };

  if (!products.length) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Simple plans
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            The right fit for your next step.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start with the essentials. Upgrade when your team is ready for more.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              For getting your business organized.
            </p>
            <p className="mt-6 text-4xl font-semibold">
              ₹0
              <span className="text-sm font-normal text-muted-foreground">
                {' '}
                / month
              </span>
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-muted-foreground">
              <li>Business profile and services</li>
              <li>Staff and weekly hours</li>
              <li>Business settings</li>
            </ul>
            <Link
              href={user ? '/dashboard' : '/signin/signup'}
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border font-medium hover:bg-surface-muted"
            >
              {user ? 'Go to dashboard' : 'Get started'}
            </Link>
          </article>
          <article className="rounded-2xl border border-brand/40 bg-brand-muted/30 p-7 shadow-sm">
            <h2 className="text-lg font-semibold">Pro</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              For growing service businesses.
            </p>
            <p className="mt-6 text-4xl font-semibold">Coming soon</p>
            <ul className="mt-6 grid gap-3 text-sm text-muted-foreground">
              <li>More team capacity</li>
              <li>Customer reminders</li>
              <li>Advanced business tools</li>
            </ul>
            <Link
              href="/signin/signup"
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand font-medium text-brand-foreground hover:brightness-95"
            >
              Join Slotly
            </Link>
          </article>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Subscription billing plans configured in Stripe will appear here
          automatically.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Simple plans
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          The right fit for your next step.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Start with what you need today. Upgrade when your team is ready.
        </p>
        {intervals.length > 1 && (
          <div className="mt-7 inline-flex rounded-lg border border-border bg-surface-muted p-1">
            {(['month', 'year'] as const)
              .filter((interval) => intervals.includes(interval))
              .map((interval) => (
                <button
                  key={interval}
                  type="button"
                  aria-pressed={billingInterval === interval}
                  onClick={() => setBillingInterval(interval)}
                  className={`rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${billingInterval === interval ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  {interval === 'month' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
          </div>
        )}
      </div>
      <div className="mt-12 flex flex-wrap justify-center gap-5">
        {products.map((product) => {
          const price =
            product.prices?.find((item) => item.interval === billingInterval) ??
            product.prices?.[0];
          if (!price) return null;
          const priceString = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: price.currency ?? 'INR',
            maximumFractionDigits: 0
          }).format((price.unit_amount ?? 0) / 100);
          return (
            <article
              key={product.id}
              className={`flex w-full max-w-sm flex-col rounded-2xl border bg-surface shadow-sm ${subscription?.prices?.products?.name === product.name ? 'border-brand ring-1 ring-brand' : 'border-border'}`}
            >
              <div className="flex-1 p-6">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="mt-3 min-h-10 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-7">
                  <span className="text-4xl font-semibold">{priceString}</span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    /{price.interval ?? 'one-time'}
                  </span>
                </p>
                <Button
                  type="button"
                  loading={priceIdLoading === price.id}
                  onClick={() => void handleStripeCheckout(price)}
                  className="mt-8 w-full"
                >
                  {subscription ? 'Manage plan' : 'Choose plan'}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
