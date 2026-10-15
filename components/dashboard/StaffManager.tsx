'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useDashboard } from './DashboardContext';
import { createClient } from '@/utils/supabase/client';
import { deactivateStaff, saveStaff } from '@/utils/dashboard/team-actions';

type Staff = {
  id: string;
  display_name: string;
  is_active: boolean;
};

const inputClass =
  'w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 text-white';

export default function StaffManager() {
  const { business, role } = useDashboard();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

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

  async function handleDeactivate(member: Staff) {
    setError('');
    setNotice('');
    try {
      const result = await deactivateStaff(business.id, member.id);
      if (!result.success) setError(result.error);
      else {
        setNotice(`${member.display_name} deactivated.`);
        await load();
      }
    } catch (deactivateError) {
      console.error('Staff deactivation failed:', deactivateError);
      setError(
        'Could not deactivate the staff member. Check your connection and try again.'
      );
    }
  }

  return (
    <section className="grid gap-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Staff</h1>
        <p className="mt-2 text-zinc-400">
          Manage your team and their schedules.
        </p>
      </header>

      {role === 'owner' && (
        <form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-zinc-800 p-5 md:grid-cols-2"
        >
          <h2 className="text-xl font-semibold text-white md:col-span-2">
            {editing ? 'Edit staff member' : 'Add a staff member'}
          </h2>
          <label className="grid gap-2 text-sm">
            Display name
            <input
              name="displayName"
              required
              maxLength={120}
              defaultValue={editing?.display_name ?? ''}
              className={inputClass}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Linked account ID (optional)
            <input
              name="userId"
              type="text"
              defaultValue=""
              className={inputClass}
            />
          </label>
          <p className="text-xs text-zinc-500 md:col-span-2">
            Enter an account ID to link or change a link. Leave blank to keep
            the current link; linking does not grant business access.
          </p>
          <div className="flex gap-3 md:col-span-2">
            <button
              disabled={saving}
              className="rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
            >
              {saving
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Add staff member'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md border border-zinc-700 px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

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
        <p className="text-zinc-400">Loading staff…</p>
      ) : staff.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-700 p-6 text-zinc-400">
          No staff members yet.
        </p>
      ) : (
        <ul className="grid gap-3">
          {staff.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-800 p-4"
            >
              <div>
                <h3 className="font-semibold text-white">
                  {member.display_name}{' '}
                  {!member.is_active && (
                    <span className="text-sm font-normal text-zinc-500">
                      (inactive)
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {role === 'owner' && (
                  <>
                    <Link
                      href={`/dashboard/staff/${member.id}/hours`}
                      className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                    >
                      Working hours
                    </Link>
                    <Link
                      href={`/dashboard/staff/${member.id}/time-off`}
                      className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                    >
                      Time off
                    </Link>
                  </>
                )}
                {role === 'owner' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(member)}
                      className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                    {member.is_active && (
                      <button
                        type="button"
                        onClick={() => void handleDeactivate(member)}
                        className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                      >
                        Deactivate
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
