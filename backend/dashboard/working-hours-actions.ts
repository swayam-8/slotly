'use server';

import { workingHoursInputSchema } from './schemas';
import { toStoredWorkingHourRanges } from './schemas';
import { createClient } from '@backend/lib/supabase/server';
import { requireBusinessRole } from './authorization';

export async function replaceWorkingHours(input: unknown) {
  const parsed = workingHoursInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Check the working hours.'
    };
  }

  const { businessId, staffId, ranges } = parsed.data;

  try {
    const supabase = await (async () => {
      const client = createClient();
      await requireBusinessRole(client, businessId);
      const { data: staff, error: staffError } = await client
        .from('staff')
        .select('id')
        .eq('id', staffId)
        .eq('business_id', businessId)
        .maybeSingle();
      if (staffError) throw new Error(staffError.message);
      if (!staff)
        throw new Error('That staff member does not belong to this business.');
      return client;
    })();

    const { error } = await supabase.rpc('replace_staff_working_hours', {
      p_staff_id: staffId,
      p_hours: toStoredWorkingHourRanges(ranges)
    });

    if (error) {
      console.error('Saving working hours failed:', error);
      return { success: false as const, error: error.message };
    }

    return { success: true as const };
  } catch (error) {
    console.error('Saving working hours failed:', error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : 'Could not save working hours.'
    };
  }
}
