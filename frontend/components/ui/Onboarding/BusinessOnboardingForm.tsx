'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Clock3, Store } from 'lucide-react';
import {
  createBusinessForWizard,
  checkBusinessSlug
} from '@backend/businesses/actions';
import {
  businessOnboardingSchema,
  createBusinessSlug
} from '@/utils/businesses/validation';
import { saveService } from '@backend/dashboard/service-actions';
import { replaceWorkingHours } from '@backend/dashboard/working-hours-actions';
import { createClient } from '@/utils/supabase/client';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select
} from '@/components/ui/primitives';

interface BusinessOnboardingFormProps {
  timeZones: string[];
}
const stepNames = ['Business details', 'First service', 'Working hours'];
const days = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
];

export default function BusinessOnboardingForm({
  timeZones
}: BusinessOnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [timezone, setTimezone] = useState(timeZones[0] ?? 'UTC');
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<
    'idle' | 'checking' | 'available' | 'unavailable'
  >('idle');
  const [slugMessage, setSlugMessage] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [openDays, setOpenDays] = useState([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [serviceSaved, setServiceSaved] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && timeZones.includes(browserTimezone))
      setTimezone(browserTimezone);
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
      setSlugMessage(
        parsed.error.issues[0]?.message ?? 'Enter a valid address.'
      );
      return;
    }
    let current = true;
    setSlugAvailability('checking');
    const timeout = window.setTimeout(async () => {
      const result = await checkBusinessSlug(slug);
      if (!current) return;
      setSlugAvailability(result.available ? 'available' : 'unavailable');
      setSlugMessage(
        result.available ? 'This address is available.' : result.message
      );
    }, 300);
    return () => {
      current = false;
      window.clearTimeout(timeout);
    };
  }, [slug]);

  function validateStep() {
    if (step === 0) {
      const parsed = businessOnboardingSchema.safeParse({
        name,
        slug,
        timezone
      });
      if (!parsed.success)
        return (
          parsed.error.issues[0]?.message ?? 'Check your business details.'
        );
      if (slugAvailability !== 'available')
        return slugAvailability === 'checking'
          ? 'Wait for the address check to finish.'
          : 'Choose an available public address.';
    }
    if (step === 1) {
      if (!serviceName.trim()) return 'Enter the name of your first service.';
      if (!Number.isFinite(Number(duration)) || Number(duration) <= 0)
        return 'Service duration must be greater than zero.';
      if (
        !/^\d+(?:\.\d{1,2})?$/.test(price) ||
        !/^\d+(?:\.\d{1,2})?$/.test(deposit)
      )
        return 'Enter valid prices with up to two decimal places.';
      if (Number(deposit) > Number(price))
        return 'The deposit cannot exceed the service price.';
    }
    if (step === 2 && openDays.length && endTime <= startTime)
      return 'Closing time must be later than opening time.';
    return '';
  }

  async function finishSetup() {
    setFormError('');
    const validationError = validateStep();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      let currentBusinessId = businessId;
      if (!currentBusinessId) {
        const result = await createBusinessForWizard({ name, slug, timezone });
        if (!result.success) {
          setFormError(result.error);
          return;
        }
        currentBusinessId = result.businessId;
        setBusinessId(currentBusinessId);
      }
      if (!currentBusinessId) {
        setFormError('Your business could not be created. Please try again.');
        return;
      }

      if (!serviceSaved) {
        const result = await saveService({
          businessId: currentBusinessId,
          name: serviceName,
          description: serviceDescription,
          durationMinutes: duration,
          priceRupees: price,
          depositRupees: deposit
        });
        if (!result.success) {
          setFormError(
            `Your business is set up, but the first service could not be saved: ${result.error}`
          );
          return;
        }
        setServiceSaved(true);
      }

      if (!hoursSaved) {
        const supabase = createClient();
        const { data: staff, error: staffError } = await supabase
          .from('staff')
          .select('id')
          .eq('business_id', currentBusinessId)
          .limit(1)
          .maybeSingle();
        if (staffError || !staff) {
          console.error(
            'Could not find the owner staff profile during setup:',
            staffError
          );
          setFormError(
            'Your business and service are saved, but we could not find the owner team profile to set hours. Continue to the dashboard to finish setup.'
          );
          return;
        }
        const ranges = openDays.map((day) => ({
          day_of_week: day,
          start_time: startTime,
          end_time: endTime
        }));
        const result = await replaceWorkingHours({
          businessId: currentBusinessId,
          staffId: staff.id,
          ranges
        });
        if (!result.success) {
          setFormError(
            `Your business and service are saved, but the weekly hours could not be saved: ${result.error}`
          );
          return;
        }
        setHoursSaved(true);
      }
      router.replace('/dashboard');
    } catch (error) {
      console.error('Onboarding wizard failed:', error);
      setFormError(
        'We could not finish setup. Check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateStep();
    setFormError(error);
    if (error) return;
    if (step < 2) setStep((current) => current + 1);
    else void finishSetup();
  }

  return (
    <main className="mx-auto min-h-[calc(100dvh-4rem)] max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand text-brand-foreground">
            <Store aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-brand">
            Let&apos;s get you set up
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Your business, ready for Slotly
          </h1>
          <p className="mt-3 text-muted-foreground">
            A few details now make the rest of your setup easier.
          </p>
        </div>
        <div
          className="my-8 grid grid-cols-3 gap-2"
          aria-label="Onboarding progress"
        >
          {stepNames.map((label, index) => (
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
        <Card>
          <CardContent className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="grid gap-5">
              {step === 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold">
                      Tell us about your business
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      These details will appear on your public profile.
                    </p>
                  </div>
                  <Input
                    label="Business name"
                    value={name}
                    onChange={(event) => {
                      const nextName = event.target.value;
                      setName(nextName);
                      if (!hasEditedSlug) setSlug(createBusinessSlug(nextName));
                    }}
                    maxLength={100}
                    required
                    autoComplete="organization"
                  />
                  <Input
                    label="Public page address"
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
                    hint={`slotly.app/b/${slug || 'your-business'}`}
                    error={
                      slugAvailability === 'unavailable'
                        ? slugMessage
                        : undefined
                    }
                  />
                  <p
                    aria-live="polite"
                    className={`text-sm ${slugAvailability === 'available' ? 'text-success' : 'text-muted-foreground'}`}
                  >
                    {slugAvailability === 'checking'
                      ? 'Checking address availability…'
                      : slugMessage}
                  </p>
                  <Select
                    label="Business timezone"
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    required
                  >
                    {timeZones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </Select>
                </>
              )}
              {step === 1 && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold">
                      Add your first service
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You can add more or change these details later.
                    </p>
                  </div>
                  <Input
                    label="Service name"
                    value={serviceName}
                    onChange={(event) => setServiceName(event.target.value)}
                    required
                    maxLength={120}
                    placeholder="e.g. Signature haircut"
                  />
                  <label className="grid gap-2 text-sm font-medium">
                    Description{' '}
                    <textarea
                      value={serviceDescription}
                      onChange={(event) =>
                        setServiceDescription(event.target.value)
                      }
                      maxLength={2000}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-normal shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="A short description for customers"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="Duration (minutes)"
                      type="number"
                      min="1"
                      max="1440"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                      required
                    />
                    <Input
                      label="Price (₹)"
                      inputMode="decimal"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      required
                    />
                    <Input
                      label="Deposit (₹)"
                      inputMode="decimal"
                      value={deposit}
                      onChange={(event) => setDeposit(event.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold">
                      When are you open?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Set a starter schedule for your owner profile. You can add
                      breaks and more hours later.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {days.map((day) => {
                      const selected = openDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setOpenDays((current) =>
                              selected
                                ? current.filter((value) => value !== day.value)
                                : [...current, day.value]
                            )
                          }
                          className={`flex min-h-12 items-center justify-between rounded-lg border px-4 text-sm font-medium ${selected ? 'border-brand bg-brand-muted text-brand' : 'border-border text-muted-foreground hover:bg-surface-muted'}`}
                        >
                          {day.label}
                          {selected && (
                            <Check aria-hidden="true" className="size-4" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Opening time"
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      required
                    />
                    <Input
                      label="Closing time"
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      required
                    />
                  </div>
                  <p className="flex items-start gap-2 rounded-lg bg-brand-muted p-3 text-sm text-brand">
                    <Clock3
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    These recurring hours will be interpreted in {timezone}.
                  </p>
                </>
              )}
              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-danger/30 bg-danger-muted p-3 text-sm text-danger"
                >
                  {formError}
                </p>
              )}
              <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0 || isSubmitting}
                  onClick={() => {
                    setFormError('');
                    setStep((current) => current - 1);
                  }}
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Back
                </Button>
                {businessId && formError && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.replace('/dashboard')}
                  >
                    Continue to dashboard
                  </Button>
                )}
                <Button type="submit" loading={isSubmitting}>
                  {step < 2 ? (
                    <>
                      Continue{' '}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </>
                  ) : (
                    'Create my business'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          You can update your services and schedule any time from your
          dashboard.
        </p>
      </div>
    </main>
  );
}
