'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useDashboard } from './DashboardContext';
import { createClient } from '@/utils/supabase/client';
import {
  deactivateService,
  saveService
} from '@/utils/dashboard/service-actions';
import { formatRupees } from '@/utils/dashboard/format';

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
  is_active: boolean;
};

const inputClass =
  'w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 text-white';

export default function ServicesManager() {
  const { business, role } = useDashboard();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<Service | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await createClient()
        .from('services')
        .select(
          'id, name, description, duration_minutes, price_cents, deposit_cents, is_active'
        )
        .eq('business_id', business.id)
        .order('created_at');
      if (queryError)
        setError(`Could not load services: ${queryError.message}`);
      else setServices(data ?? []);
    } catch (queryError) {
      console.error('Loading services failed:', queryError);
      setError('Could not load services. Check your connection and try again.');
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
    setError('');
    setNotice('');
    setSaving(true);
    const form = new FormData(formElement);
    try {
      const result = await saveService({
        businessId: business.id,
        ...(editing ? { id: editing.id } : {}),
        name: form.get('name'),
        description: form.get('description'),
        durationMinutes: form.get('duration'),
        priceRupees: form.get('price'),
        depositRupees: form.get('deposit')
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(editing ? 'Service updated.' : 'Service added.');
      setEditing(null);
      formElement.reset();
      await load();
    } catch (submitError) {
      console.error('Service form submission failed:', submitError);
      setError(
        'Could not save the service. Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(service: Service) {
    setError('');
    setNotice('');
    try {
      const result = await deactivateService(business.id, service.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(`${service.name} deactivated.`);
      await load();
    } catch (deactivateError) {
      console.error('Service deactivation failed:', deactivateError);
      setError(
        'Could not deactivate the service. Check your connection and try again.'
      );
    }
  }

  return (
    <section className="grid gap-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Services</h1>
        <p className="mt-2 text-zinc-400">
          Manage the services your business offers.
        </p>
      </header>

      {role === 'owner' && (
        <form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-zinc-800 p-5 md:grid-cols-2"
        >
          <h2 className="text-xl font-semibold text-white md:col-span-2">
            {editing ? 'Edit service' : 'Add a service'}
          </h2>
          <label className="grid gap-2 text-sm">
            Name
            <input
              name="name"
              required
              maxLength={120}
              defaultValue={editing?.name ?? ''}
              className={inputClass}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Duration (minutes)
            <input
              name="duration"
              type="number"
              min="1"
              max="1440"
              required
              defaultValue={editing?.duration_minutes ?? 30}
              className={inputClass}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Price (₹)
            <input
              name="price"
              inputMode="decimal"
              required
              defaultValue={
                editing ? (editing.price_cents / 100).toFixed(2) : ''
              }
              className={inputClass}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Deposit (₹)
            <input
              name="deposit"
              inputMode="decimal"
              required
              defaultValue={
                editing ? (editing.deposit_cents / 100).toFixed(2) : '0.00'
              }
              className={inputClass}
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            Description
            <textarea
              name="description"
              maxLength={2000}
              defaultValue={editing?.description ?? ''}
              className={inputClass}
              rows={3}
            />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              disabled={saving}
              className="rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add service'}
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
        <p className="text-zinc-400">Loading services…</p>
      ) : services.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-700 p-6 text-zinc-400">
          No services yet. Add your first service above.
        </p>
      ) : (
        <ul className="grid gap-3">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-800 p-4"
            >
              <div>
                <h3 className="font-semibold text-white">
                  {service.name}{' '}
                  {!service.is_active && (
                    <span className="text-sm font-normal text-zinc-500">
                      (inactive)
                    </span>
                  )}
                </h3>
                <p className="text-sm text-zinc-400">
                  {service.duration_minutes} min ·{' '}
                  {formatRupees(service.price_cents)} · deposit{' '}
                  {formatRupees(service.deposit_cents)}
                </p>
                {service.description && (
                  <p className="mt-1 text-sm text-zinc-400">
                    {service.description}
                  </p>
                )}
              </div>
              {role === 'owner' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(service)}
                    className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  {service.is_active && (
                    <button
                      type="button"
                      onClick={() => void handleDeactivate(service)}
                      className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
