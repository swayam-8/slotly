'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDashboard } from './DashboardContext';
import { createClient } from '@/utils/supabase/client';
import { replaceWorkingHours } from '@/utils/dashboard/working-hours-actions';
import {
  validateWorkingHours,
  type WorkingHourRange
} from '@/utils/dashboard/working-hours';

const days = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
];

const newRange = (day: number): WorkingHourRange => ({
  day_of_week: day,
  start_time: '09:00',
  end_time: '17:00'
});

export default function WorkingHoursEditor({ staffId }: { staffId: string }) {
  const { business, role } = useDashboard();
  const [ranges, setRanges] = useState<WorkingHourRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const client = createClient();
      const { data: staff, error: staffError } = await client
        .from('staff')
        .select('id')
        .eq('id', staffId)
        .eq('business_id', business.id)
        .maybeSingle();
      if (staffError || !staff) {
        setError(
          staffError?.message ?? 'Staff member not found in this business.'
        );
        return;
      }
      const { data, error: queryError } = await client
        .from('working_hours')
        .select('day_of_week, start_time, end_time')
        .eq('staff_id', staffId)
        .order('day_of_week')
        .order('start_time');
      if (queryError)
        setError(`Could not load working hours: ${queryError.message}`);
      else
        setRanges(
          (data ?? []).map((range) => ({
            ...range,
            start_time: range.start_time.slice(0, 5),
            end_time: range.end_time.slice(0, 5)
          }))
        );
    } catch (queryError) {
      console.error('Loading working hours failed:', queryError);
      setError(
        'Could not load working hours. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [business.id, staffId]);

  useEffect(() => {
    if (role === 'owner') void load();
    else setLoading(false);
  }, [load, role]);

  function updateRange(
    index: number,
    field: 'start_time' | 'end_time',
    value: string
  ) {
    setRanges((current) =>
      current.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, [field]: value } : range
      )
    );
  }

  async function save() {
    const validation = validateWorkingHours(ranges);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await replaceWorkingHours({
        businessId: business.id,
        staffId,
        ranges
      });
      if (!result.success) setError(result.error);
      else setNotice('Weekly schedule saved.');
    } catch (saveError) {
      console.error('Working-hours submission failed:', saveError);
      setError(
        'Could not save working hours. Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (role !== 'owner') {
    return (
      <p className="text-zinc-400">
        Only a business owner can view or edit working hours.
      </p>
    );
  }

  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Working hours</h1>
        <p className="mt-2 text-zinc-400">
          Times are recurring local times in {business.timezone}.
        </p>
      </header>
      {loading ? (
        <p className="text-zinc-400">Loading schedule…</p>
      ) : (
        <>
          <div className="grid gap-4">
            {days.map((day) => {
              const dayRanges = ranges
                .map((range, index) => ({ range, index }))
                .filter(({ range }) => range.day_of_week === day.value);
              return (
                <fieldset
                  key={day.value}
                  className="grid gap-3 rounded-lg border border-zinc-800 p-4"
                >
                  <legend className="px-2 font-semibold text-white">
                    {day.label}
                  </legend>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={dayRanges.length > 0}
                      onChange={(event) =>
                        setRanges((current) =>
                          event.target.checked
                            ? [...current, newRange(day.value)]
                            : current.filter(
                                (range) => range.day_of_week !== day.value
                              )
                        )
                      }
                    />
                    Open
                  </label>
                  {dayRanges.length === 0 ? (
                    <p className="text-sm text-zinc-500">Closed</p>
                  ) : (
                    dayRanges.map(({ range, index }, rangeNumber) => (
                      <div
                        key={`${day.value}-${rangeNumber}`}
                        className="flex flex-wrap items-end gap-3"
                      >
                        <label className="grid gap-1 text-sm">
                          Opens
                          <input
                            aria-label={`${day.label} range ${rangeNumber + 1} starts`}
                            type="time"
                            value={range.start_time}
                            onChange={(event) =>
                              updateRange(
                                index,
                                'start_time',
                                event.target.value
                              )
                            }
                            className="rounded-md bg-zinc-900 p-2"
                          />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Closes
                          <input
                            aria-label={`${day.label} range ${rangeNumber + 1} ends`}
                            type="time"
                            value={range.end_time}
                            onChange={(event) =>
                              updateRange(index, 'end_time', event.target.value)
                            }
                            className="rounded-md bg-zinc-900 p-2"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setRanges((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index
                              )
                            )
                          }
                          className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                        >
                          Remove range
                        </button>
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setRanges((current) => [...current, newRange(day.value)])
                    }
                    className="justify-self-start text-sm text-zinc-300 underline"
                  >
                    Add time range
                  </button>
                </fieldset>
              );
            })}
          </div>
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
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="justify-self-start rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save weekly schedule'}
          </button>
        </>
      )}
    </section>
  );
}
