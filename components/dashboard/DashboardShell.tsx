'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { DashboardProvider } from './DashboardContext';
import type { DashboardBusiness } from '@/utils/dashboard/context';

const navigation = [
  { label: 'Overview', href: '/dashboard', ownerOnly: false },
  { label: 'Services', href: '/dashboard/services', ownerOnly: false },
  { label: 'Staff', href: '/dashboard/staff', ownerOnly: false },
  { label: 'Settings', href: '/dashboard/settings', ownerOnly: true }
];

export default function DashboardShell({
  business,
  role,
  children
}: PropsWithChildren<{
  business: DashboardBusiness;
  role: 'owner' | 'staff';
}>) {
  const pathname = usePathname();

  return (
    <DashboardProvider value={{ business, role }}>
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-6">
        <aside className="w-full shrink-0 md:w-56">
          <p className="mb-1 truncate text-lg font-semibold text-white">
            {business.name}
          </p>
          <p className="mb-6 text-sm capitalize text-zinc-400">{role}</p>
          <nav aria-label="Dashboard navigation" className="grid gap-2">
            {navigation.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const disabled = item.ownerOnly && role !== 'owner';

              return disabled ? (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className="rounded-md px-3 py-2 text-zinc-600"
                >
                  {item.label} <span className="text-xs">(owner only)</span>
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-2 ${
                    active
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DashboardProvider>
  );
}
