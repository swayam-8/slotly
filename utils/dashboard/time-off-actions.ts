'use server';

import { createClient } from '@/utils/supabase/server';
import { convertTimeOffInput, timeOffInputSchema } from './schemas';
import { requireStaffOwner } from './staff-actions';

export async function addTimeOff(input: unknown) {
  const parsed = timeOffInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Check the time-off details.'
    };
  }

  const { businessId, staffId, startsAt, endsAt, reason } = parsed.data;
  try {
    const supabase = await requireStaffOwner(businessId, staffId);
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('timezone')
      .eq('id', businessId)
      .single();

    if (businessError) throw new Error(businessError.message);
    const utcRange = convertTimeOffInput(startsAt, endsAt, business.timezone);
    const { error } = await supabase.from('time_off').insert({
      staff_id: staffId,
      starts_at: utcRange.startsAt,
      ends_at: utcRange.endsAt,
      reason: reason || null
    });

    if (error) {
      console.error('Adding time off failed:', error);
      return { success: false as const, error: error.message };
    }
    return { success: true as const };
  } catch (error) {
    console.error('Adding time off failed:', error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Could not add time off.'
    };
  }
}

export async function removeTimeOff(
  businessId: string,
  staffId: string,
  timeOffId: string
) {
  try {
    const supabase = await requireStaffOwner(businessId, staffId);
    const { error } = await supabase
      .from('time_off')
      .delete()
      .eq('id', timeOffId)
      .eq('staff_id', staffId)
      .select('id')
      .single();
    if (error) {
      console.error('Removing time off failed:', error);
      return { success: false as const, error: error.message };
    }
    return { success: true as const };
  } catch (error) {
    console.error('Removing time off failed:', error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : 'Could not remove time off.'
    };
  }
}

export async function getTimeOff(businessId: string, staffId: string) {
  try {
    const supabase = await requireStaffOwner(businessId, staffId);
    const { data, error } = await supabase
      .from('time_off')
      .select('id, starts_at, ends_at, reason')
      .eq('staff_id', staffId)
      .order('starts_at');

    if (error) throw new Error(error.message);
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    console.error('Loading time off failed:', error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : 'Could not load time off.',
      data: []
    };
  }
}
