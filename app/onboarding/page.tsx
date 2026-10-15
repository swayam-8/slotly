import { redirect } from 'next/navigation';
import BusinessOnboardingForm from '@/components/ui/Onboarding/BusinessOnboardingForm';
import { createClient } from '@/utils/supabase/server';
import { getPostAuthPath } from '@/utils/businesses/access';

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Could not check the current user: ${error.message}`);
  }

  if (!user) {
    redirect('/signin');
  }

  const destination = await getPostAuthPath(supabase, user.id);
  if (destination === '/dashboard') {
    redirect(destination);
  }

  const timeZones = ['UTC', ...Intl.supportedValuesOf('timeZone')];

  return <BusinessOnboardingForm timeZones={timeZones} />;
}
