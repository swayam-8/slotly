'use client';

import Button from '@/components/ui/Button';
import { handleRequest } from '@/utils/auth-helpers/client';
import { createBusiness, checkBusinessSlug } from '@/utils/businesses/actions';
import {
  businessOnboardingSchema,
  createBusinessSlug
} from '@/utils/businesses/validation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BusinessOnboardingFormProps {
  timeZones: string[];
}

export default function BusinessOnboardingForm({
  timeZones
}: BusinessOnboardingFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [timezone, setTimezone] = useState(timeZones[0] ?? 'UTC');
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<
    'idle' | 'checking' | 'available' | 'unavailable'
  >('idle');
  const [slugMessage, setSlugMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && timeZones.includes(browserTimezone)) {
      setTimezone(browserTimezone);
    }
  }, [timeZones]);

  useEffect(() => {
    if (slug.length < 3) {
      setSlugAvailability('idle');
      setSlugMessage('');
      return;
    }

    const parsed = businessOnboardingSchema.shape.slug.safeParse(slug);
    if (!parsed.success) {
      setSlugAvailability('unavailable');
      setSlugMessage(parsed.error.issues[0]?.message ?? 'Enter a valid slug.');
      return;
    }

    let isCurrent = true;
    setSlugAvailability('checking');
    setSlugMessage('Checking availability...');

    const timeout = window.setTimeout(async () => {
      const result = await checkBusinessSlug(slug);
      if (!isCurrent) return;
      setSlugAvailability(result.available ? 'available' : 'unavailable');
      setSlugMessage(
        result.available ? 'This slug is available.' : result.message
      );
    }, 300);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [slug]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const parsed = businessOnboardingSchema.safeParse({
      name,
      slug,
      timezone
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ??
          'Please review the form and try again.'
      );
      return;
    }

    if (slugAvailability !== 'available') {
      setFormError(
        slugAvailability === 'checking'
          ? 'Wait for the slug availability check to finish.'
          : 'Choose an available business slug.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await handleRequest(event, createBusiness, router);
    } catch (error) {
      console.error('Business onboarding submission failed:', error);
      setFormError(
        'Connection problem. The business was not created; please try again.'
      );
    }
    setIsSubmitting(false);
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Set up your business</h1>
      <p className="mt-2 text-zinc-300">
        Add the basic details customers will use to find your booking page.
      </p>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label htmlFor="business-name">Business name</label>
          <input
            id="business-name"
            name="name"
            value={name}
            onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
              if (!hasEditedSlug) setSlug(createBusinessSlug(nextName));
            }}
            maxLength={100}
            required
            className="w-full rounded-md bg-zinc-800 p-3"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="business-slug">Public page address</label>
          <div className="flex items-center rounded-md bg-zinc-800">
            <span className="pl-3 text-zinc-400">/</span>
            <input
              id="business-slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setHasEditedSlug(true);
                setSlug(event.target.value.toLowerCase());
              }}
              minLength={3}
              maxLength={50}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              autoCapitalize="none"
              className="w-full rounded-md bg-transparent p-3"
              aria-describedby="slug-status"
            />
          </div>
          <p
            id="slug-status"
            aria-live="polite"
            className={
              slugAvailability === 'available'
                ? 'text-sm text-green-400'
                : 'text-sm text-zinc-400'
            }
          >
            {slugMessage || 'Use lowercase letters, numbers, and hyphens.'}
          </p>
        </div>

        <div className="grid gap-2">
          <label htmlFor="business-timezone">Timezone</label>
          <select
            id="business-timezone"
            name="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            required
            className="w-full rounded-md bg-zinc-800 p-3"
          >
            {timeZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-red-400">
            {formError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Create business
        </Button>
      </form>
    </section>
  );
}
