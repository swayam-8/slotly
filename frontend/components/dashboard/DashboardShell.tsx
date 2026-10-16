'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { DashboardProvider } from './DashboardContext';
import type { DashboardBusiness } from '@/utils/dashboard/context';
import {
  Badge,
  Button,
  DropdownMenu,
  toastError
} from '@/components/ui/primitives';
import { createClient } from '@/utils/supabase/client';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  Bell,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  LayoutDashboard,
  Settings,
  UsersRound,
  Scissors,
  Menu
} from 'lucide-react';

const navigation = [
  {
    label: 'Overview',
    href: '/dashboard',
    ownerOnly: false,
    icon: LayoutDashboard
  },
  {
    label: 'Bookings',
    href: '/dashboard/bookings',
    ownerOnly: false,
    icon: CalendarDays
  },
  {
    label: 'Calendar',
    href: '/dashboard/calendar',
    ownerOnly: false,
    icon: CalendarRange
  },
  {
    label: 'Customers',
    href: '/dashboard/customers',
    ownerOnly: false,
    icon: UsersRound
  },
  {
    label: 'Services',
    href: '/dashboard/services',
    ownerOnly: true,
    icon: Scissors
  },
  {
    label: 'Staff',
    href: '/dashboard/staff',
    ownerOnly: true,
    icon: UsersRound
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    ownerOnly: true,
    icon: Settings
  }
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
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function signOut() {
    try {
      const { error } = await createClient().auth.signOut();
      if (error) {
        console.error('Could not sign out:', error);
        toastError('Sign out failed', 'Please try again.');
        return;
      }
      router.replace('/signin');
      router.refresh();
    } catch (error) {
      console.error('Sign out request failed:', error);
      toastError('Sign out failed', 'Check your connection and try again.');
    }
  }

  return (
    <DashboardProvider value={{ business, role }}>
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-6">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2.5 font-semibold"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <span className="hidden sm:inline">Slotly</span>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="hidden lg:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
            <button
              type="button"
              disabled
              aria-label={`Business workspace: ${business.name}. Switching workspaces is not available yet.`}
              title="Business switching is coming soon"
              className="hidden min-w-0 items-center gap-3 rounded-xl border border-border px-3 py-2 text-left opacity-80 sm:flex"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-muted text-sm font-semibold text-brand">
                {business.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {business.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  Business workspace
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Notifications coming soon"
                title="Notifications are coming soon"
                disabled
              >
                <Bell aria-hidden="true" className="size-5" />
              </Button>
              <DropdownMenu
                label="Account"
                items={[
                  {
                    label: 'Profile and billing',
                    onSelect: () => router.push('/account')
                  },
                  ...(role === 'owner'
                    ? [
                        {
                          label: 'Business settings',
                          onSelect: () => router.push('/dashboard/settings')
                        }
                      ]
                    : []),
                  {
                    label: 'Sign out',
                    onSelect: () => void signOut(),
                    destructive: true
                  }
                ]}
              />
            </div>
          </div>
          <details className="group border-t border-border sm:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium marker:hidden">
              <Menu aria-hidden="true" className="size-4" /> Menu{' '}
              <span className="ml-auto text-xs text-muted-foreground">
                {business.name}
              </span>
            </summary>
            <nav
              aria-label="Dashboard navigation"
              className="grid gap-1 border-t border-border px-3 py-3"
            >
              {navigation.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const disabled = item.ownerOnly && role !== 'owner';
                return disabled ? (
                  <span
                    key={item.href}
                    aria-disabled="true"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground"
                  >
                    {item.label} <span className="text-xs">(owner only)</span>
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? 'bg-brand-muted text-brand' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}
                  >
                    <item.icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </details>
        </header>
        <div className="mx-auto flex max-w-[96rem] gap-7 px-4 py-6 sm:px-6 lg:py-8">
          <aside
            className={`hidden shrink-0 transition-[width] duration-200 lg:block ${collapsed ? 'w-16' : 'w-56'}`}
          >
            <div
              className={`mb-5 rounded-xl border border-border bg-surface p-4 ${collapsed ? 'px-3' : ''}`}
            >
              <div
                className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="grid size-9 place-items-center rounded-lg bg-brand-muted text-sm font-semibold text-brand">
                  {business.name.slice(0, 1).toUpperCase()}
                </span>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {business.name}
                    </p>
                    <Badge
                      variant={role === 'owner' ? 'brand' : 'neutral'}
                      className="mt-1 w-fit capitalize"
                    >
                      {role}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <nav aria-label="Dashboard navigation" className="grid gap-1">
              {navigation.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const disabled = item.ownerOnly && role !== 'owner';
                return disabled ? (
                  <span
                    key={item.href}
                    aria-disabled="true"
                    title={collapsed ? `${item.label} (owner only)` : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <item.icon aria-hidden="true" className="size-4" />
                    {!collapsed && item.label}
                    {collapsed && (
                      <span className="sr-only">{item.label} (owner only)</span>
                    )}
                    {!collapsed && <span className="sr-only">owner only</span>}
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center px-2' : ''} ${active ? 'bg-brand-muted text-brand' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}
                  >
                    <item.icon aria-hidden="true" className="size-4" />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
