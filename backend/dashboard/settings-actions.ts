'use server';

import { businessSettingsSchema } from './schemas';
import { runOwnerAction } from './actions';

export async function updateBusinessSettings(input: unknown) {
  const parsed = businessSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Check the business settings.'
    };
  }

  const { businessId, name, timezone } = parsed.data;
  return runOwnerAction(
    businessId,
    async (supabase) =>
      await supabase
        .from('businesses')
        .update({ name, timezone })
        .eq('id', businessId)
        .select('id')
        .single()
  );
}
