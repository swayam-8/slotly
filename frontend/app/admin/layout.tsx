import { redirect } from 'next/navigation';
import { createClient } from '@backend/lib/supabase/server';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') {
    throw new Error(
      `Could not verify platform administrator: ${error.message}`
    );
  }
  if (!user) redirect('/signin');
  const isPlatformAdmin =
    user.app_metadata?.role === 'platform_admin' ||
    user.app_metadata?.platform_admin === true;
  if (!isPlatformAdmin) redirect('/dashboard');
  return children;
}
