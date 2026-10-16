import PlaceholderViews from '@/components/dashboard/PlaceholderViews';
import {
  getBookingsPlaceholderData,
  getCustomersPlaceholderData
} from '@/utils/placeholders/dashboard';

export const metadata = { title: 'Bookings' };

export default async function BookingsPage() {
  const [bookings, customers] = await Promise.all([
    getBookingsPlaceholderData(),
    getCustomersPlaceholderData()
  ]);
  return (
    <PlaceholderViews
      view="bookings"
      bookings={bookings}
      customers={customers}
    />
  );
}
