import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { getOverviewPlaceholderData } from '@/utils/placeholders/dashboard';

export const metadata = { title: 'Overview' };

export default async function DashboardOverviewPage() {
  const data = await getOverviewPlaceholderData();
  return <DashboardOverview data={data} />;
}
