import TimeOffManager from '@/components/dashboard/TimeOffManager';

export default function StaffTimeOffPage({
  params
}: {
  params: { id: string };
}) {
  return <TimeOffManager staffId={params.id} />;
}
