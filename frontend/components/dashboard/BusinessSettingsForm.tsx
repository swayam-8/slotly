'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from './DashboardContext';
import { updateBusinessSettings } from '@backend/dashboard/settings-actions';
import {
  Button,
  Card,
  CardContent,
  ErrorState,
  Input,
  PageHeader,
  Select
} from '@/components/ui/primitives';

export default function BusinessSettingsForm({
  timeZones
}: {
  timeZones: string[];
}) {
  const { business, role } = useDashboard();
  const router = useRouter();
  const [name, setName] = useState(business.name);
  const [timezone, setTimezone] = useState(business.timezone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await updateBusinessSettings({
        businessId: business.id,
        name,
        timezone
      });
      if (!result.success) setError(result.error);
      else {
        setNotice('Business settings saved.');
        router.refresh();
      }
    } catch (saveError) {
      console.error('Business settings submission failed:', saveError);
      setError(
        'Could not save business settings. Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Business settings"
        description="Update your public business name and timezone."
      />
      {role !== 'owner' ? (
        <p className="text-muted-foreground">
          Only a business owner can change settings.
        </p>
      ) : (
        <Card className="max-w-xl">
          <CardContent className="grid gap-5 pt-5">
            <form onSubmit={submit} className="grid gap-5">
              <Input
                label="Business name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
              />
              <Input
                label="Public slug"
                value={business.slug}
                readOnly
                aria-readonly="true"
                hint="Your public link is not editable yet."
              />
              <Select
                label="Timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                {!timeZones.includes(timezone) && (
                  <option value={timezone}>{timezone}</option>
                )}
                {timeZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replaceAll('_', ' ')}
                  </option>
                ))}
              </Select>
              <p className="rounded-lg bg-warning-muted p-3 text-sm text-warning">
                Changing the timezone affects how recurring working hours are
                interpreted.
              </p>
              {error && <ErrorState description={error} />}
              {notice && (
                <p role="status" className="text-sm font-medium text-success">
                  {notice}
                </p>
              )}
              <Button
                type="submit"
                loading={saving}
                className="justify-self-start"
              >
                Save settings
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
