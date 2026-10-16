import Link from 'next/link';
import { ArrowLeft, Building2, UsersRound } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/primitives';
import { getPlatformAdminPlaceholderData } from '@/utils/placeholders/dashboard';

export const metadata = { title: 'Platform admin' };

export default async function PlatformAdminPage() {
  const data = await getPlatformAdminPlaceholderData();
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" className="font-semibold">
            Slotly{' '}
            <span className="ml-2 text-xs font-medium text-muted-foreground">
              Platform admin
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to app
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:px-8">
        <PageHeader
          title="Platform overview"
          description="A high-level view of Slotly's businesses and users."
          action={<Badge variant="warning">Preview data</Badge>}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {data.stats.map((stat, index) => {
            const Icon = index === 0 ? Building2 : UsersRound;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <Icon aria-hidden="true" className="size-5 text-brand" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Businesses</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sample tenant list · live platform data will be connected later.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.businesses.map((business) => (
                  <TableRow key={business.name}>
                    <TableCell className="font-medium">
                      {business.name}
                    </TableCell>
                    <TableCell>{business.owner}</TableCell>
                    <TableCell>{business.plan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          business.status === 'Active' ? 'success' : 'warning'
                        }
                      >
                        {business.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <p className="text-sm text-muted-foreground">
              Example platform users for layout preview.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Platform role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((person) => (
                  <TableRow key={person.email}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    <TableCell>{person.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
