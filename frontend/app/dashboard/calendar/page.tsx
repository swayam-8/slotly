import PlaceholderViews from '@/components/dashboard/PlaceholderViews';
import {
  getBookingsPlaceholderData,
  getCustomersPlaceholderData
} from '@/utils/placeholders/dashboard';

export const metadata = { title: 'Calendar' };

export default async function CalendarPage() {
  const [bookings, customers] = await Promise.all([
    getBookingsPlaceholderData(),
    getCustomersPlaceholderData()
  ]);
  return (
    <PlaceholderViews
      view="calendar"
      bookings={bookings}
      customers={customers}
    />
  );
}
