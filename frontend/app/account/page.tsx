import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import { redirect } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { PageHeader } from '@/components/ui/primitives';
import { createClient } from '@backend/lib/supabase/server';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@backend/lib/supabase/queries';

export default async function Account() {
  const supabase = createClient();
  const [user, userDetails, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="mx-auto grid max-w-5xl gap-5 px-5 py-10 sm:px-8 sm:py-14"
      >
        <PageHeader
          title="Your account"
          description="Manage your profile and subscription billing."
        />
        <CustomerPortalForm subscription={subscription} />
        <NameForm userName={userDetails?.full_name ?? ''} />
        <EmailForm userEmail={user.email} />
      </main>
      <Footer />
    </>
  );
}
