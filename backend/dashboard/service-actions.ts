'use server';

import { serviceInputSchema } from './schemas';
import { runOwnerAction, type ActionResult } from './actions';

type ServiceResult = ActionResult<{
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
  is_active: boolean;
  created_at: string;
} | null>;

export async function saveService(input: unknown): Promise<ServiceResult> {
  const parsed = serviceInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Check the service details.'
    };
  }

  const service = parsed.data;
  return runOwnerAction(service.businessId, async (supabase) => {
    const values = {
      business_id: service.businessId,
      name: service.name,
      description: service.description || null,
      duration_minutes: service.durationMinutes,
      price_cents: service.priceRupees,
      deposit_cents: service.depositRupees
    };

    if (service.id) {
      return await supabase
        .from('services')
        .update(values)
        .eq('id', service.id)
        .eq('business_id', service.businessId)
        .select('*')
        .single();
    }

    return await supabase.from('services').insert(values).select('*').single();
  });
}

export async function deactivateService(businessId: string, serviceId: string) {
  return runOwnerAction(
    businessId,
    async (supabase) =>
      await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId)
        .eq('business_id', businessId)
        .select('id')
        .single()
  );
}
