import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicBookingFlow from '@/components/booking/PublicBookingFlow';
import { createClient } from '@backend/lib/supabase/server';
import {
  getAvailabilityPlaceholderData,
  getPublicBookingPlaceholder,
  type PublicBookingProfile
} from '@/utils/placeholders/dashboard';

type PageProps = { params: { slug: string } };

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  return { title: `Book an appointment at ${params.slug}` };
}

export default async function PublicBusinessBookingPage({ params }: PageProps) {
  const supabase = createClient();
  let business: PublicBookingProfile | null = null;
  const { data: directory, error: directoryError } = await supabase
    .from('business_directory')
    .select('id, name, slug, timezone')
    .eq('slug', params.slug)
    .maybeSingle();

  if (directoryError) {
    console.error('Could not load public business directory:', directoryError);
  } else if (directory) {
    const [
      { data: services, error: serviceError },
      { data: staff, error: staffError }
    ] = await Promise.all([
      supabase
        .from('services')
        .select(
          'id, name, description, duration_minutes, price_cents, deposit_cents'
        )
        .eq('business_id', directory.id)
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('staff')
        .select('id, display_name')
        .eq('business_id', directory.id)
        .eq('is_active', true)
        .order('display_name')
    ]);
    if (serviceError || staffError) {
      console.error(
        'Could not load public booking options:',
        serviceError ?? staffError
      );
      notFound();
    }
    business = {
      id: directory.id,
      name: directory.name,
      slug: directory.slug,
      timezone: directory.timezone,
      description: 'Choose a service and find a time that works for you.',
      services: (services ?? []).map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description ?? '',
        durationMinutes: service.duration_minutes,
        priceCents: service.price_cents,
        depositCents: service.deposit_cents
      })),
      staff: (staff ?? []).map((member) => ({
        id: member.id,
        displayName: member.display_name
      }))
    };
  }

  if (!business) business = await getPublicBookingPlaceholder(params.slug);
  if (!business || business.services.length === 0) notFound();
  const slots = await getAvailabilityPlaceholderData();
  return <PublicBookingFlow business={business} slotOptions={slots} />;
}
