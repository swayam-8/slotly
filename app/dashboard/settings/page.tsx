import BusinessSettingsForm from '@/components/dashboard/BusinessSettingsForm';

export default function BusinessSettingsPage() {
  const timeZones = ['UTC', ...Intl.supportedValuesOf('timeZone')];
  return <BusinessSettingsForm timeZones={timeZones} />;
}
