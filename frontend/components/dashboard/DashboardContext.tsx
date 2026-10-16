'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';
import type { DashboardContextValue } from '@/utils/dashboard/context';

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  value,
  children
}: PropsWithChildren<{ value: DashboardContextValue }>) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('Dashboard components must be inside DashboardProvider.');
  }
  return context;
}
