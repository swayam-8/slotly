'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from './DashboardContext';
import { updateBusinessSettings } from '@/utils/dashboard/settings-actions';

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
      <header>
        <h1 className="text-3xl font-bold text-white">Business settings</h1>
        <p className="mt-2 text-zinc-400">
          Update your public business name and timezone.
        </p>
      </header>
      {role !== 'owner' ? (
        <p className="text-zinc-400">
          Only a business owner can change settings.
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="grid max-w-xl gap-5 rounded-lg border border-zinc-800 p-5"
        >
          <label className="grid gap-2 text-sm">
            Business name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              className="rounded-md border border-zinc-700 bg-zinc-900 p-3 text-white"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Public slug
            <input
              value={business.slug}
              readOnly
              aria-readonly="true"
              className="rounded-md border border-zinc-800 bg-zinc-950 p-3 text-zinc-500"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Timezone
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-900 p-3 text-white"
            >
              {!timeZones.includes(timezone) && (
                <option value={timezone}>{timezone}</option>
              )}
              {timeZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-amber-300">
            Changing the timezone affects how recurring working hours are
            interpreted.
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-green-400">
              {notice}
            </p>
          )}
          <button
            disabled={saving}
            className="justify-self-start rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      )}
    </section>
  );
}
