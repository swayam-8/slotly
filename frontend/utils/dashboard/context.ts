export interface DashboardBusiness {
  id: string;
  name: string;
  slug: string;
  timezone: string;
}

export interface DashboardContextValue {
  business: DashboardBusiness;
  role: 'owner' | 'staff';
}
