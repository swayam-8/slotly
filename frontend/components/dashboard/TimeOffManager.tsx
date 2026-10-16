'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useDashboard } from './DashboardContext';
import {
  addTimeOff,
  getTimeOff,
  removeTimeOff
} from '@backend/dashboard/time-off-actions';
import { utcToBusinessLocalDateTime } from '@/utils/dashboard/timezone';
import {
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton
} from '@/components/ui/primitives';

type TimeOff = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};
export default function TimeOffManager({ staffId }: { staffId: string }) {
  const { business, role } = useDashboard();
  const [periods, setPeriods] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  async function remove() {
    if (!removingId) return;
    try {
      const result = await removeTimeOff(business.id, staffId, removingId);
      if (!result.success) setError(result.error);
      else {
        setNotice('Time off removed.');
        setRemovingId(null);
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
      <p className="text-muted-foreground">
        Only a business owner can view or manage time off.
      </p>
    );
  }

  return (
    <section className="grid gap-7">
      <PageHeader
        title="Time off"
        description={`Enter local times in ${business.timezone}; they are stored as UTC instants.`}
      />
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Input
              label="Starts"
              name="startsAt"
              type="datetime-local"
              required
            />
            <Input label="Ends" name="endsAt" type="datetime-local" required />
            <Input
              label="Reason"
              name="reason"
              maxLength={500}
              placeholder="Holiday, leave, break…"
              className="md:col-span-2"
            />
            <Button
              type="submit"
              loading={saving}
              className="justify-self-start"
            >
              Add time off
            </Button>
          </form>
        </CardContent>
      </Card>
      {error && <ErrorState description={error} />}
      {notice && (
        <p role="status" className="text-sm font-medium text-success">
          {notice}
        </p>
      )}
      {loading ? (
        <div className="grid gap-3" aria-label="Loading time off">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : periods.length === 0 ? (
        <EmptyState
          title="No time off periods"
          description="Holidays, leave, and breaks you add will appear here."
        />
      ) : (
        <ul className="grid gap-3">
          {periods.map((period) => (
            <li key={period.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
                  <div>
                    <p className="font-medium">
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {period.reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemovingId(period.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(removingId)}
        onOpenChange={(open) => {
          if (!open) setRemovingId(null);
        }}
        title="Remove this time-off period?"
        description="This period will be removed from the staff schedule."
        confirmLabel="Remove period"
        destructive
        onConfirm={() => void remove()}
      />
    </section>
  );
}
