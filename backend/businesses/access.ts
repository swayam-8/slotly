import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';

export async function getPostAuthPath(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    throw new Error(`Could not check business membership: ${error.message}`);
  }

  return data.length > 0 ? '/dashboard' : '/onboarding';
}
