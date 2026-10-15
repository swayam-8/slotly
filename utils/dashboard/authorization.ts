import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';

export async function requireBusinessRole(
  supabase: SupabaseClient<Database>,
  businessId: string,
  allowedRoles: Array<'owner' | 'staff'> = ['owner']
) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError)
    throw new Error(`Could not verify the current user: ${authError.message}`);
  if (!user) throw new Error('You must be signed in.');

  const { data: membership, error } = await supabase
    .from('business_members')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error)
    throw new Error(`Could not verify business access: ${error.message}`);
  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new Error('You do not have permission to perform this action.');
  }

  return { user, role: membership.role };
}
