import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

const title = 'Slotly — Booking, made simple';
const description =
  'A calmer way for salons, clinics, and independent professionals to manage bookings.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: { default: title, template: '%s | Slotly' },
  description: description,
  openGraph: {
    title: title,
    description: description,
    type: 'website',
    images: ['/api/og']
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-dvh">{children}</div>
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
