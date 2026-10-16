'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useDashboard } from './DashboardContext';
import { createClient } from '@/utils/supabase/client';
import {
  deactivateService,
  saveService
} from '@backend/dashboard/service-actions';
import { formatRupees } from '@/utils/dashboard/format';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
  Textarea
} from '@/components/ui/primitives';

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
  is_active: boolean;
};

export default function ServicesManager() {
  const { business, role } = useDashboard();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<Service | null>(null);
  const [deactivating, setDeactivating] = useState<Service | null>(null);

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
    const form = new FormData(formElement);
    setError('');
    setNotice('');
    setSaving(true);
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

  async function handleDeactivate() {
    if (!deactivating) return;
    const service = deactivating;
    setError('');
    try {
      const result = await deactivateService(business.id, service.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(`${service.name} deactivated.`);
      setDeactivating(null);
      await load();
    } catch (deactivateError) {
      console.error('Service deactivation failed:', deactivateError);
      setError(
        'Could not deactivate the service. Check your connection and try again.'
      );
    }
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Services"
        description="Manage the services your business offers."
      />

      {role === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit service' : 'Add a service'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              key={editing?.id ?? 'new'}
              onSubmit={handleSubmit}
              className="grid gap-4 md:grid-cols-2"
            >
              <Input
                label="Service name"
                name="name"
                required
                maxLength={120}
                defaultValue={editing?.name ?? ''}
              />
              <Input
                label="Duration (minutes)"
                name="duration"
                type="number"
                min="1"
                max="1440"
                required
                defaultValue={editing?.duration_minutes ?? 30}
              />
              <Input
                label="Price (₹)"
                name="price"
                inputMode="decimal"
                required
                defaultValue={
                  editing ? (editing.price_cents / 100).toFixed(2) : ''
                }
                hint="Enter an amount with up to two decimal places."
              />
              <Input
                label="Deposit (₹)"
                name="deposit"
                inputMode="decimal"
                required
                defaultValue={
                  editing ? (editing.deposit_cents / 100).toFixed(2) : '0.00'
                }
              />
              <Textarea
                label="Description"
                name="description"
                maxLength={2000}
                defaultValue={editing?.description ?? ''}
                className="md:col-span-2"
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" loading={saving}>
                  {editing ? 'Save changes' : 'Add service'}
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
        <div className="grid gap-3" aria-label="Loading services">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add your first service to start setting up your business offering."
        />
      ) : (
        <ul className="grid gap-3">
          {services.map((service) => (
            <li key={service.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
                  <div className="grid gap-1">
                    <h2 className="flex flex-wrap items-center gap-2 font-semibold">
                      {service.name}
                      {!service.is_active && <Badge>Inactive</Badge>}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {service.duration_minutes} min ·{' '}
                      {formatRupees(service.price_cents)} · deposit{' '}
                      {formatRupees(service.deposit_cents)}
                    </p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                  {role === 'owner' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(service)}
                      >
                        Edit
                      </Button>
                      {service.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeactivating(service)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  )}
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
        title="Deactivate this service?"
        description={`${deactivating?.name ?? 'This service'} will no longer be active. Existing records will be retained.`}
        confirmLabel="Deactivate service"
        destructive
        onConfirm={() => void handleDeactivate()}
      />
    </section>
  );
}
