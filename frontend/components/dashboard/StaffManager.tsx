'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useDashboard } from './DashboardContext';
import { createClient } from '@/utils/supabase/client';
import { deactivateStaff, saveStaff } from '@backend/dashboard/team-actions';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton
} from '@/components/ui/primitives';

type Staff = {
  id: string;
  display_name: string;
  is_active: boolean;
};

export default function StaffManager() {
  const { business, role } = useDashboard();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deactivating, setDeactivating] = useState<Staff | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await createClient()
        .from('staff')
        .select('id, display_name, is_active')
        .eq('business_id', business.id)
        .order('display_name');
      if (queryError) setError(`Could not load staff: ${queryError.message}`);
      else setStaff(data ?? []);
    } catch (queryError) {
      console.error('Loading staff failed:', queryError);
      setError('Could not load staff. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [business.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const result = await saveStaff({
        businessId: business.id,
        ...(editing ? { id: editing.id } : {}),
        displayName: form.get('displayName'),
        userId: form.get('userId')
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(editing ? 'Staff member updated.' : 'Staff member added.');
      setEditing(null);
      formElement.reset();
      await load();
    } catch (submitError) {
      console.error('Staff form submission failed:', submitError);
      setError(
        'Could not save the staff member. Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivating) return;
    const member = deactivating;
    setError('');
    try {
      const result = await deactivateStaff(business.id, member.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(`${member.display_name} deactivated.`);
      setDeactivating(null);
      await load();
    } catch (deactivateError) {
      console.error('Staff deactivation failed:', deactivateError);
      setError(
        'Could not deactivate the staff member. Check your connection and try again.'
      );
    }
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Staff"
        description="Manage your team and their schedules."
      />

      {role === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editing ? 'Edit staff member' : 'Add a staff member'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              key={editing?.id ?? 'new'}
              onSubmit={handleSubmit}
              className="grid gap-4 md:grid-cols-2"
            >
              <Input
                label="Display name"
                name="displayName"
                required
                maxLength={120}
                defaultValue={editing?.display_name ?? ''}
              />
              <Input
                label="Linked account ID (optional)"
                name="userId"
                hint="Linking an account does not grant business access. Leave blank to keep the current link."
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" loading={saving}>
                  {editing ? 'Save changes' : 'Add staff member'}
                </Button>
                {editing && (
                  <Button variant="secondary" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && <ErrorState description={error} onRetry={() => void load()} />}
      {notice && (
        <p role="status" className="text-sm font-medium text-success">
          {notice}
        </p>
      )}
      {loading ? (
        <div className="grid gap-3" aria-label="Loading staff">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          title="No staff members yet"
          description="Add team members here. Your owner profile is created automatically during onboarding."
        />
      ) : (
        <ul className="grid gap-3">
          {staff.map((member) => (
            <li key={member.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
                  <div className="font-semibold">
                    {member.display_name}
                    {!member.is_active && (
                      <Badge className="ml-2">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role === 'owner' && (
                      <>
                        <ButtonLink
                          href={`/dashboard/staff/${member.id}/hours`}
                          variant="outline"
                          size="sm"
                        >
                          Working hours
                        </ButtonLink>
                        <ButtonLink
                          href={`/dashboard/staff/${member.id}/time-off`}
                          variant="outline"
                          size="sm"
                        >
                          Time off
                        </ButtonLink>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(member)}
                        >
                          Edit
                        </Button>
                        {member.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeactivating(member)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(deactivating)}
        onOpenChange={(open) => {
          if (!open) setDeactivating(null);
        }}
        title="Deactivate this staff member?"
        description={`${deactivating?.display_name ?? 'This staff member'} will no longer be active. Existing records are retained.`}
        confirmLabel="Deactivate staff"
        destructive
        onConfirm={() => void handleDeactivate()}
      />
    </section>
  );
}
