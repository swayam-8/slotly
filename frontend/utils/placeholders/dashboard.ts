export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type PlaceholderBooking = {
  id: string;
  customer: string;
  email: string;
  service: string;
  staff: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  status: BookingStatus;
};

export type PlaceholderCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
  totalSpentCents: number;
};

const bookingSeeds: PlaceholderBooking[] = [
  {
    id: 'BK-1048',
    customer: 'Aarav Mehta',
    email: 'aarav@example.com',
    service: 'Signature haircut',
    staff: 'Maya Patel',
    startsAt: '2026-10-16T09:30:00+05:30',
    endsAt: '2026-10-16T10:15:00+05:30',
    priceCents: 120000,
    status: 'confirmed'
  },
  {
    id: 'BK-1049',
    customer: 'Priya Shah',
    email: 'priya@example.com',
    service: 'Skin consultation',
    staff: 'Riya Singh',
    startsAt: '2026-10-16T10:45:00+05:30',
    endsAt: '2026-10-16T11:30:00+05:30',
    priceCents: 80000,
    status: 'pending'
  },
  {
    id: 'BK-1050',
    customer: 'Rohan Kapoor',
    email: 'rohan@example.com',
    service: 'Color & refresh',
    staff: 'Maya Patel',
    startsAt: '2026-10-16T12:00:00+05:30',
    endsAt: '2026-10-16T13:30:00+05:30',
    priceCents: 240000,
    status: 'confirmed'
  },
  {
    id: 'BK-1051',
    customer: 'Ananya Rao',
    email: 'ananya@example.com',
    service: 'Follow-up session',
    staff: 'Dev Shah',
    startsAt: '2026-10-17T14:00:00+05:30',
    endsAt: '2026-10-17T14:45:00+05:30',
    priceCents: 90000,
    status: 'confirmed'
  },
  {
    id: 'BK-1052',
    customer: 'Kabir Joshi',
    email: 'kabir@example.com',
    service: 'Signature haircut',
    staff: 'Maya Patel',
    startsAt: '2026-10-17T16:00:00+05:30',
    endsAt: '2026-10-17T16:45:00+05:30',
    priceCents: 120000,
    status: 'completed'
  },
  {
    id: 'BK-1053',
    customer: 'Meera Iyer',
    email: 'meera@example.com',
    service: 'Skin consultation',
    staff: 'Riya Singh',
    startsAt: '2026-10-18T11:00:00+05:30',
    endsAt: '2026-10-18T11:30:00+05:30',
    priceCents: 80000,
    status: 'cancelled'
  },
  {
    id: 'BK-1054',
    customer: 'Ishaan Verma',
    email: 'ishaan@example.com',
    service: 'Color & refresh',
    staff: 'Dev Shah',
    startsAt: '2026-10-19T13:30:00+05:30',
    endsAt: '2026-10-19T15:00:00+05:30',
    priceCents: 240000,
    status: 'confirmed'
  }
];

const customerSeeds: PlaceholderCustomer[] = [
  {
    id: 'CU-201',
    name: 'Aarav Mehta',
    email: 'aarav@example.com',
    phone: '+91 98765 43210',
    visits: 8,
    lastVisit: '16 Oct 2026',
    totalSpentCents: 840000
  },
  {
    id: 'CU-202',
    name: 'Priya Shah',
    email: 'priya@example.com',
    phone: '+91 98765 12345',
    visits: 4,
    lastVisit: '12 Oct 2026',
    totalSpentCents: 320000
  },
  {
    id: 'CU-203',
    name: 'Rohan Kapoor',
    email: 'rohan@example.com',
    phone: '+91 98123 45678',
    visits: 3,
    lastVisit: '10 Oct 2026',
    totalSpentCents: 520000
  },
  {
    id: 'CU-204',
    name: 'Ananya Rao',
    email: 'ananya@example.com',
    phone: '+91 99887 76655',
    visits: 6,
    lastVisit: '9 Oct 2026',
    totalSpentCents: 410000
  },
  {
    id: 'CU-205',
    name: 'Kabir Joshi',
    email: 'kabir@example.com',
    phone: '+91 98989 78787',
    visits: 2,
    lastVisit: '7 Oct 2026',
    totalSpentCents: 180000
  },
  {
    id: 'CU-206',
    name: 'Meera Iyer',
    email: 'meera@example.com',
    phone: '+91 97777 12345',
    visits: 5,
    lastVisit: '6 Oct 2026',
    totalSpentCents: 460000
  }
];

// TODO(step-8): Replace sample dashboard metrics with tenant-scoped Supabase queries.
export async function getOverviewPlaceholderData() {
  return {
    stats: [
      {
        label: 'Bookings today',
        value: '8',
        change: '+2 from yesterday',
        icon: 'calendar'
      },
      {
        label: "This week's revenue",
        value: '₹24,800',
        change: '+12% from last week',
        icon: 'revenue'
      },
      {
        label: 'Upcoming bookings',
        value: '24',
        change: 'Across 3 team members',
        icon: 'upcoming'
      },
      {
        label: 'No-show rate',
        value: '2.4%',
        change: 'Down 0.8% this month',
        icon: 'noshow'
      }
    ],
    chart: [
      { label: 'Mon', value: 38 },
      { label: 'Tue', value: 55 },
      { label: 'Wed', value: 43 },
      { label: 'Thu', value: 72 },
      { label: 'Fri', value: 60 },
      { label: 'Sat', value: 90 },
      { label: 'Sun', value: 32 }
    ],
    bookings: bookingSeeds.slice(0, 4)
  };
}

// TODO(step-8): Replace local example data with filtered, paginated booking queries.
export async function getBookingsPlaceholderData(): Promise<
  PlaceholderBooking[]
> {
  return bookingSeeds.map((booking) => ({ ...booking }));
}

// TODO(step-8): Replace sample customer list with tenant-scoped customer and history queries.
export async function getCustomersPlaceholderData(): Promise<
  PlaceholderCustomer[]
> {
  return customerSeeds.map((customer) => ({ ...customer }));
}

// TODO(step-4b): Replace generated-looking sample availability with the real slot-generation service.
export async function getAvailabilityPlaceholderData() {
  return [
    '09:00',
    '09:30',
    '10:30',
    '11:00',
    '13:00',
    '14:00',
    '15:30',
    '16:00'
  ];
}

export type PublicBookingProfile = {
  id?: string;
  name: string;
  slug: string;
  timezone: string;
  description: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    durationMinutes: number;
    priceCents: number;
    depositCents: number;
  }>;
  staff: Array<{ id: string; displayName: string }>;
};

export async function getPublicBookingPlaceholder(
  slug: string
): Promise<PublicBookingProfile | null> {
  // TODO(step-4b): Replace the demo profile with the public business view and active service/staff queries.
  if (slug !== 'studio-bloom') return null;
  return {
    name: 'Studio Bloom',
    slug,
    timezone: 'Asia/Kolkata',
    description: 'Thoughtful cuts, color, and a little time just for you.',
    services: [
      {
        id: 'service-cut',
        name: 'Signature haircut',
        description: 'A tailored cut and finish.',
        durationMinutes: 45,
        priceCents: 120000,
        depositCents: 30000
      },
      {
        id: 'service-color',
        name: 'Color & refresh',
        description: 'A fresh look, finished with care.',
        durationMinutes: 90,
        priceCents: 240000,
        depositCents: 60000
      },
      {
        id: 'service-consult',
        name: 'Style consultation',
        description: 'Talk through your next look with a stylist.',
        durationMinutes: 30,
        priceCents: 80000,
        depositCents: 20000
      }
    ],
    staff: [
      { id: 'staff-maya', displayName: 'Maya Patel' },
      { id: 'staff-riya', displayName: 'Riya Singh' }
    ]
  };
}

// TODO(step-8): Replace platform sample records with admin-only aggregate queries.
export async function getPlatformAdminPlaceholderData() {
  return {
    stats: [
      { label: 'Businesses', value: '128' },
      { label: 'Active this month', value: '96' },
      { label: 'Platform bookings', value: '2,840' }
    ],
    businesses: [
      {
        name: 'Studio Bloom',
        owner: 'Maya Patel',
        plan: 'Free',
        status: 'Active'
      },
      {
        name: 'Northside Wellness',
        owner: 'Riya Singh',
        plan: 'Pro',
        status: 'Active'
      },
      {
        name: 'The Learning Room',
        owner: 'Dev Shah',
        plan: 'Free',
        status: 'Trial'
      }
    ],
    users: [
      { name: 'Maya Patel', email: 'maya@example.com', role: 'Owner' },
      { name: 'Riya Singh', email: 'riya@example.com', role: 'Owner' },
      { name: 'Dev Shah', email: 'dev@example.com', role: 'Staff' }
    ]
  };
}
