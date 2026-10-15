import { createClient } from '@/utils/supabase/server';
import { requireBusinessRole } from './authorization';

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function runOwnerAction<T>(
  businessId: string,
  operation: (supabase: ReturnType<typeof createClient>) => Promise<{
    data: T | null;
    error: { message: string; code?: string } | null;
  }>
): Promise<ActionResult<T | null>> {
  try {
    const supabase = createClient();
    await requireBusinessRole(supabase, businessId);
    const { data, error } = await operation(supabase);
    if (error) {
      console.error('Dashboard update failed:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Dashboard action failed:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'The request failed. Please try again.'
    };
  }
}
