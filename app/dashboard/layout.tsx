import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { createClient } from '@/utils/supabase/server';
import type { DashboardBusiness } from '@/utils/dashboard/context';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError)
    throw new Error(`Could not verify your session: ${authError.message}`);
  if (!user) redirect('/signin');

  const { data: membership, error: membershipError } = await supabase
    .from('business_members')
    .select('business_id, role')
    .eq('user_id', user.id)
    .order('business_id')
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `Could not load business membership: ${membershipError.message}`
    );
  }
  if (!membership) redirect('/onboarding');

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, slug, timezone')
    .eq('id', membership.business_id)
    .single();

  if (businessError || !business) {
    throw new Error(
      `Could not load the current business: ${businessError?.message ?? 'Business not found.'}`
    );
  }

  const dashboardBusiness: DashboardBusiness = business;

  return (
    <DashboardShell business={dashboardBusiness} role={membership.role}>
      {children}
    </DashboardShell>
  );
}
