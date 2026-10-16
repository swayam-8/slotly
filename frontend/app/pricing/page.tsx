import type { Metadata } from 'next';
import Pricing from '@/components/ui/Pricing/Pricing';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { createClient } from '@backend/lib/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@backend/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple plans for service businesses using Slotly.'
};

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Pricing
          user={user}
          products={products ?? []}
          subscription={subscription}
        />
      </main>
      <Footer />
    </>
  );
}
