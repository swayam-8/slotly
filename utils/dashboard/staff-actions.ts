import { createClient } from '@/utils/supabase/server';
import { requireBusinessRole } from './authorization';

export async function requireStaffOwner(businessId: string, staffId: string) {
  const supabase = createClient();
  await requireBusinessRole(supabase, businessId);

  const { data: staff, error } = await supabase
    .from('staff')
    .select('id')
    .eq('id', staffId)
    .eq('business_id', businessId)
    .maybeSingle();

  if (error) throw new Error(`Could not verify staff member: ${error.message}`);
  if (!staff)
    throw new Error('That staff member does not belong to this business.');

  return supabase;
}
