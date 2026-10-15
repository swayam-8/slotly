'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useDashboard } from './DashboardContext';
import {
  addTimeOff,
  getTimeOff,
  removeTimeOff
} from '@/utils/dashboard/time-off-actions';
import { utcToBusinessLocalDateTime } from '@/utils/dashboard/timezone';

type TimeOff = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};
const inputClass =
  'w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 text-white';

export default function TimeOffManager({ staffId }: { staffId: string }) {
  const { business, role } = useDashboard();
  const [periods, setPeriods] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getTimeOff(business.id, staffId);
      if (!result.success) setError(result.error);
      else setPeriods(result.data);
    } catch (queryError) {
      console.error('Loading time off failed:', queryError);
      setError('Could not load time off. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [business.id, staffId]);

  useEffect(() => {
    if (role === 'owner') void load();
    else setLoading(false);
  }, [load, role]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const values = new FormData(formElement);
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await addTimeOff({
        businessId: business.id,
        staffId,
        startsAt: values.get('startsAt'),
        endsAt: values.get('endsAt'),
        reason: values.get('reason')
      });
      if (!result.success) setError(result.error);
      else {
        setNotice('Time off added.');
        formElement.reset();
        await load();
      }
    } catch (submitError) {
      console.error('Time-off submission failed:', submitError);
      setError('Could not add time off. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      const result = await removeTimeOff(business.id, staffId, id);
      if (!result.success) setError(result.error);
      else {
        setNotice('Time off removed.');
        await load();
      }
    } catch (removeError) {
      console.error('Time-off removal failed:', removeError);
      setError(
        'Could not remove time off. Check your connection and try again.'
      );
    }
  }

  if (role !== 'owner') {
    return (
      <p className="text-zinc-400">
        Only a business owner can view or manage time off.
      </p>
    );
  }

  return (
    <section className="grid gap-7">
      <header>
        <h1 className="text-3xl font-bold text-white">Time off</h1>
        <p className="mt-2 text-zinc-400">
          Enter local times in {business.timezone}; they are stored as UTC
          instants.
        </p>
      </header>
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-lg border border-zinc-800 p-5 md:grid-cols-2"
      >
        <label className="grid gap-2 text-sm">
          Starts
          <input
            name="startsAt"
            type="datetime-local"
            required
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm">
          Ends
          <input
            name="endsAt"
            type="datetime-local"
            required
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm md:col-span-2">
          Reason
          <input
            name="reason"
            maxLength={500}
            placeholder="Holiday, leave, break…"
            className={inputClass}
          />
        </label>
        <button
          disabled={saving}
          className="justify-self-start rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Add time off'}
        </button>
      </form>
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
      {loading ? (
        <p className="text-zinc-400">Loading time off…</p>
      ) : periods.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-700 p-6 text-zinc-400">
          No time off periods recorded.
        </p>
      ) : (
        <ul className="grid gap-3">
          {periods.map((period) => (
            <li
              key={period.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 p-4"
            >
              <div>
                <p className="text-white">
                  {utcToBusinessLocalDateTime(
                    period.starts_at,
                    business.timezone
                  ).replace('T', ' ')}{' '}
                  –{' '}
                  {utcToBusinessLocalDateTime(
                    period.ends_at,
                    business.timezone
                  ).replace('T', ' ')}
                </p>
                {period.reason && (
                  <p className="text-sm text-zinc-400">{period.reason}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void remove(period.id)}
                className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
