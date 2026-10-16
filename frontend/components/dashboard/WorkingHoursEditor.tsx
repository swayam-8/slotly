'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDashboard } from './DashboardContext';
import { createClient } from '@/utils/supabase/client';
import { replaceWorkingHours } from '@backend/dashboard/working-hours-actions';
import {
  validateWorkingHours,
  type WorkingHourRange
} from '@/utils/dashboard/working-hours';
import {
  Button,
  Card,
  ErrorState,
  Input,
  PageHeader,
  Skeleton
} from '@/components/ui/primitives';

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
      <p className="text-muted-foreground">
        Only a business owner can view or edit working hours.
      </p>
    );
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Working hours"
        description={`Times are recurring local times in ${business.timezone}.`}
      />
      {loading ? (
        <div className="grid gap-3" aria-label="Loading schedule">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {days.map((day) => {
              const dayRanges = ranges
                .map((range, index) => ({ range, index }))
                .filter(({ range }) => range.day_of_week === day.value);
              return (
                <Card key={day.value}>
                  <fieldset className="grid gap-3 p-4">
                    <legend className="px-2 font-semibold text-foreground">
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
                      <p className="text-sm text-muted-foreground">Closed</p>
                    ) : (
                      dayRanges.map(({ range, index }, rangeNumber) => (
                        <div
                          key={`${day.value}-${rangeNumber}`}
                          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                        >
                          <Input
                            label={`${day.label} range ${rangeNumber + 1} starts`}
                            type="time"
                            value={range.start_time}
                            onChange={(event) =>
                              updateRange(
                                index,
                                'start_time',
                                event.target.value
                              )
                            }
                          />
                          <Input
                            label={`${day.label} range ${rangeNumber + 1} ends`}
                            type="time"
                            value={range.end_time}
                            onChange={(event) =>
                              updateRange(index, 'end_time', event.target.value)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() =>
                              setRanges((current) =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index
                                )
                              )
                            }
                          >
                            Remove range
                          </Button>
                        </div>
                      ))
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      type="button"
                      onClick={() =>
                        setRanges((current) => [
                          ...current,
                          newRange(day.value)
                        ])
                      }
                    >
                      Add time range
                    </Button>
                  </fieldset>
                </Card>
              );
            })}
          </div>
          {error && <ErrorState description={error} />}
          {notice && (
            <p role="status" className="text-sm font-medium text-success">
              {notice}
            </p>
          )}
          <Button
            variant="primary"
            type="button"
            onClick={() => void save()}
            loading={saving}
            className="justify-self-start"
          >
            Save weekly schedule
          </Button>
        </>
      )}
    </section>
  );
}
