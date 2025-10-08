
"use client";

import { useAuth } from '../../../hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { ShieldAlert, Settings as SettingsIcon } from 'lucide-react';
import type { User } from '../../../types';

export default function AdminSettingsPage() {
  const { user, loading, appSettings, updateAppSettings } = useAuth();
  const router = useRouter();

  const authorizedRoles: User['role'][] = ['admin'];

  if (loading) {
    return <div className="text-center py-10"><p>Loading admin settings...</p></div>;
  }

  if (!user || !authorizedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }

  const handleToggleTicketSales = async (isEnabled: boolean) => {
    if (updateAppSettings) {
      await updateAppSettings({ ticketSalesEnabled: isEnabled });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8 text-accent" />
            Application Settings
          </CardTitle>
          <CardDescription>Manage global settings for the CPHVA Connect application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="ticket-sales-switch" className="text-base font-medium">Ticket Sales</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the ability for users to purchase tickets.
              </p>
            </div>
            <Switch
              id="ticket-sales-switch"
              checked={appSettings.ticketSalesEnabled}
              onCheckedChange={handleToggleTicketSales}
              aria-label="Toggle ticket sales"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
