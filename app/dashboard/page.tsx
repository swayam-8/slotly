'use client';

import { useDashboard } from '@/components/dashboard/DashboardContext';

export default function DashboardOverviewPage() {
  const { business } = useDashboard();

  return (
    <section>
      <h1 className="text-3xl font-bold text-white">Overview</h1>
      <p className="mt-3 text-zinc-300">
        Welcome to {business.name}. Your business settings and team management
        are available from the sidebar.
      </p>
    </section>
  );
}
