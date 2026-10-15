'use server';

import { staffInputSchema } from './schemas';
import { runOwnerAction } from './actions';

export async function saveStaff(input: unknown) {
  const parsed = staffInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Check the staff details.'
    };
  }

  const staff = parsed.data;
  return runOwnerAction(staff.businessId, async (supabase) => {
    const values = {
      business_id: staff.businessId,
      display_name: staff.displayName,
      user_id: staff.userId
    };

    if (staff.id) {
      return await supabase
        .from('staff')
        .update({
          display_name: values.display_name,
          ...(staff.userId ? { user_id: staff.userId } : {})
        })
        .eq('id', staff.id)
        .eq('business_id', staff.businessId)
        .select('*')
        .single();
    }

    return await supabase.from('staff').insert(values).select('*').single();
  });
}

export async function deactivateStaff(businessId: string, staffId: string) {
  return runOwnerAction(
    businessId,
    async (supabase) =>
      await supabase
        .from('staff')
        .update({ is_active: false })
        .eq('id', staffId)
        .eq('business_id', businessId)
        .select('id')
        .single()
  );
}
