import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import BusinessSettingsForm from '@/components/dashboard/BusinessSettingsForm';
import { createClient } from '@backend/lib/supabase/server';
import { getSubscription } from '@backend/lib/supabase/queries';

export default async function BusinessSettingsPage() {
  const supabase = createClient();
  const subscription = await getSubscription(supabase);
  const timeZones = ['UTC', ...Intl.supportedValuesOf('timeZone')];
  return (
    <div className="grid gap-6">
      <BusinessSettingsForm timeZones={timeZones} />
      <CustomerPortalForm subscription={subscription} />
    </div>
  );
}
