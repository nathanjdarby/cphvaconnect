
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/use-auth';
import type { Ticket, User } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '../../../components/ui/table';
import { ShieldAlert, ListOrdered, CheckCircle2, XCircle, Users, TicketCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '../../../hooks/use-toast';

export default function AdminAttendancePage() {
  const { user, loading, allTickets, toggleTicketCheckIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const authorizedRoles: User['role'][] = ['admin', 'organiser'];

  const { checkedInTickets, pendingTickets, summary } = useMemo(() => {
    if (!allTickets) return { checkedInTickets: [], pendingTickets: [], summary: { total: 0, checkedIn: 0, pending: 0 } };
    
    const checkedIn = allTickets.filter(ticket => ticket.isCheckedIn).sort((a, b) => {
      if (a.checkInTimestamp && b.checkInTimestamp) {
        return parseISO(b.checkInTimestamp).getTime() - parseISO(a.checkInTimestamp).getTime();
      }
      return 0;
    });
    const pending = allTickets.filter(ticket => !ticket.isCheckedIn).sort((a,b) => a.userName.localeCompare(b.userName));
    
    return {
      checkedInTickets: checkedIn,
      pendingTickets: pending,
      summary: {
        total: allTickets.length,
        checkedIn: checkedIn.length,
        pending: pending.length,
      }
    };
  }, [allTickets]);

  const handleToggleCheckIn = async (ticketId: string) => {
    const success = await toggleTicketCheckIn(ticketId);
    if (success) {
      toast({ title: 'Check-in Status Updated' });
    } else {
      toast({ title: 'Error Updating Check-in', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-10"><p>Loading attendance report...</p></div>;
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

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <ListOrdered className="mr-3 h-8 w-8 text-accent" />
            Attendance Report
          </CardTitle>
          <CardDescription>Overview of attendee check-in status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card className="bg-secondary/30 p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">TOTAL TICKETS</p>
              <p className="text-3xl font-bold text-primary">{summary.total}</p>
            </Card>
            <Card className="bg-green-600/10 dark:bg-green-400/20 text-green-700 dark:text-green-300 p-4 shadow-sm rounded-md">
              <p className="text-sm font-medium">CHECKED-IN</p>
              <p className="text-3xl font-bold">{summary.checkedIn}</p>
            </Card>
            <Card className="bg-orange-500/10 dark:bg-orange-400/20 text-orange-600 dark:text-orange-400 p-4 shadow-sm rounded-md">
              <p className="text-sm font-medium">PENDING CHECK-IN</p>
              <p className="text-3xl font-bold">{summary.pending}</p>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Checked-In Attendees Table */}
            <section>
              <h2 className="text-2xl font-semibold text-primary/90 mb-3 flex items-center">
                <CheckCircle2 className="mr-2 h-6 w-6 text-green-600" /> Checked-In Attendees ({summary.checkedIn})
              </h2>
              {checkedInTickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No attendees have checked in yet.</p>
              ) : (
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableCaption>Attendees who have successfully checked in.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attendee Name</TableHead>
                        <TableHead>Ticket Type</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkedInTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.userName}</TableCell>
                          <TableCell>{ticket.ticketType}</TableCell>
                          <TableCell>
                            {ticket.checkInTimestamp ? format(parseISO(ticket.checkInTimestamp), 'MMM d, yyyy p') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleToggleCheckIn(ticket.id)}
                              title="Undo Check-In"
                            >
                              <XCircle className="mr-1 h-4 w-4" /> Undo Check-In
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* Pending Check-In Attendees Table */}
            <section>
              <h2 className="text-2xl font-semibold text-primary/90 mb-3 flex items-center">
                <XCircle className="mr-2 h-6 w-6 text-orange-500" /> Attendees Pending Check-In ({summary.pending})
              </h2>
              {pendingTickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">All ticket holders have checked in or no tickets sold.</p>
              ) : (
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableCaption>Attendees who have not yet checked in.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attendee Name</TableHead>
                        <TableHead>Ticket Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.userName}</TableCell>
                          <TableCell>{ticket.ticketType}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleToggleCheckIn(ticket.id)}
                              title="Check In"
                            >
                              <TicketCheck className="mr-1 h-4 w-4" /> Check In
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
