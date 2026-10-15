import WorkingHoursEditor from '@/components/dashboard/WorkingHoursEditor';

export default function StaffHoursPage({ params }: { params: { id: string } }) {
  return <WorkingHoursEditor staffId={params.id} />;
}
