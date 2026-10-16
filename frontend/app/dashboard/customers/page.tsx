import PlaceholderViews from '@/components/dashboard/PlaceholderViews';
import {
  getBookingsPlaceholderData,
  getCustomersPlaceholderData
} from '@/utils/placeholders/dashboard';

export const metadata = { title: 'Customers' };

export default async function CustomersPage() {
  const [bookings, customers] = await Promise.all([
    getBookingsPlaceholderData(),
    getCustomersPlaceholderData()
  ]);
  return (
    <PlaceholderViews
      view="customers"
      bookings={bookings}
      customers={customers}
    />
  );
}
