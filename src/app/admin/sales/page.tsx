"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/use-auth";
import type { Ticket, User } from "../../../types";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import QrCodeDisplay from "../../../components/ticket/qr-code-display";
import {
  ShieldAlert,
  DollarSign,
  Search,
  QrCode as QrCodeIcon,
  TicketCheck,
  XCircle,
  Trash2,
  Download,
  PlusCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "../../../hooks/use-toast";
import { AdminCreateTicketForm } from "../../../components/admin/admin-create-ticket-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";

export default function AdminSalesPage() {
  const {
    user,
    loading,
    allTickets,
    toggleTicketCheckIn,
    deleteTicket,
    allUsers,
    allTicketTypes,
    adminCreateUser,
    adminCreateTicket,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [qrDialogTicket, setQrDialogTicket] = useState<Ticket | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isCreateTicketSheetOpen, setIsCreateTicketSheetOpen] = useState(false);

  const authorizedRoles: User["role"][] = ["admin", "organiser"];

  const salesSummary = useMemo(() => {
    if (!allTickets) return { totalTicketsSold: 0, totalRevenue: 0 };
    const totalTicketsSold = allTickets.length;
    const totalRevenue = allTickets.reduce(
      (sum, ticket) => sum + (ticket.ticketPrice || 0),
      0
    );
    return { totalTicketsSold, totalRevenue };
  }, [allTickets]);

  const filteredTickets = useMemo(() => {
    if (!allTickets) return [];
    let ticketsToFilter = [...allTickets].sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
    if (!searchTerm.trim()) return ticketsToFilter;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return ticketsToFilter.filter(
      (ticket) =>
        ticket.userName.toLowerCase().includes(lowerSearchTerm) ||
        ticket.ticketType.toLowerCase().includes(lowerSearchTerm) ||
        ticket.qrCodeValue.toLowerCase().includes(lowerSearchTerm) ||
        (ticket.isCheckedIn && "checked in".includes(lowerSearchTerm)) ||
        (!ticket.isCheckedIn && "not checked in".includes(lowerSearchTerm))
    );
  }, [allTickets, searchTerm]);

  const handleToggleCheckIn = async (ticketId: string) => {
    const success = await toggleTicketCheckIn(ticketId);
    if (success) {
      toast({ title: "Check-in Status Updated" });
    } else {
      toast({ title: "Error Updating Check-in", variant: "destructive" });
    }
  };

  const handleDeleteConfirmation = (ticket: Ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteAlertOpen(true);
  };

  const executeDeleteTicket = async () => {
    if (ticketToDelete && user?.role === "admin") {
      const success = await deleteTicket(ticketToDelete.id);
      if (success) {
        toast({
          title: "Ticket Deleted",
          description: `Ticket ID ${ticketToDelete.qrCodeValue} has been removed.`,
        });
      }
      setIsDeleteAlertOpen(false);
      setTicketToDelete(null);
    } else {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to delete tickets.",
        variant: "destructive",
      });
      setIsDeleteAlertOpen(false);
      setTicketToDelete(null);
    }
  };

  const handleExportTable = () => {
    if (filteredTickets.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Attendee Name",
      "Ticket Type",
      "Purchase Date",
      "Price Paid (£)",
      "Ticket ID",
      "Status",
      "Check-in Time",
    ];
    const csvRows = [headers.join(",")];

    filteredTickets.forEach((ticket) => {
      const status = ticket.isCheckedIn ? "Checked In" : "Not Checked In";
      const checkInTime =
        ticket.isCheckedIn && ticket.checkInTimestamp
          ? format(parseISO(ticket.checkInTimestamp), "MMM d, yyyy p")
          : "N/A";
      const row = [
        `"${ticket.userName.replace(/"/g, '""')}"`,
        `"${ticket.ticketType.replace(/"/g, '""')}"`,
        format(parseISO(ticket.purchaseDate), "yyyy-MM-dd"),
        (ticket.ticketPrice || 0).toFixed(2),
        `"${ticket.qrCodeValue.replace(/"/g, '""')}"`,
        `"${status}"`,
        `"${checkInTime}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `cphva_sales_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Export Successful",
        description: "Sales report CSV has been downloaded.",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "Your browser does not support this feature.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading sales report...</p>
      </div>
    );
  }

  if (!user || !authorizedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Go to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <DollarSign className="mr-3 h-8 w-8 text-accent" />
              Ticket Sales Report
            </CardTitle>
            <CardDescription>
              Overview of all tickets sold for CPHVA Connect.
            </CardDescription>
          </div>
          {user.role === "admin" && (
            <Button onClick={() => setIsCreateTicketSheetOpen(true)} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Ticket
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <Card className="bg-secondary/30 p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                TOTAL TICKETS SOLD
              </p>
              <p className="text-3xl font-bold text-primary">
                {salesSummary.totalTicketsSold}
              </p>
            </Card>
            <Card className="bg-secondary/30 p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                TOTAL REVENUE
              </p>
              <p className="text-3xl font-bold text-primary">
                £{salesSummary.totalRevenue.toFixed(2)}
              </p>
            </Card>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, type, ID, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm flex-grow"
              />
            </div>
            {!allTickets || allTickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tickets have been sold yet.
              </p>
            ) : filteredTickets.length === 0 && searchTerm ? (
              <p className="text-muted-foreground text-center py-8">
                No tickets match your search.
              </p>
            ) : (
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableCaption>
                    A list of all tickets sold. {filteredTickets.length}{" "}
                    ticket(s) found.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Attendee Name</TableHead>
                      <TableHead className="w-[15%]">Ticket Type</TableHead>
                      <TableHead className="w-[15%]">Purchase Date</TableHead>
                      <TableHead className="w-[10%] text-right">
                        Price (£)
                      </TableHead>
                      <TableHead className="w-[15%]">Ticket ID</TableHead>
                      <TableHead className="w-[10%]">Status</TableHead>
                      <TableHead className="w-[15%] text-center whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          {ticket.userName}
                        </TableCell>
                        <TableCell>{ticket.ticketType}</TableCell>
                        <TableCell>
                          {format(parseISO(ticket.purchaseDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {(ticket.ticketPrice || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs break-all">
                          {ticket.qrCodeValue}
                        </TableCell>
                        <TableCell>
                          {ticket.isCheckedIn ? (
                            <span className="flex items-center text-green-600">
                              <TicketCheck className="mr-1.5 h-4 w-4" /> Checked
                              In
                              {ticket.checkInTimestamp && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (
                                  {format(
                                    parseISO(ticket.checkInTimestamp),
                                    "HH:mm"
                                  )}
                                  )
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="flex items-center text-orange-500">
                              <XCircle className="mr-1.5 h-4 w-4" /> Not Checked
                              In
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQrDialogTicket(ticket)}
                              title="Show QR Code"
                            >
                              <QrCodeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={
                                ticket.isCheckedIn ? "destructive" : "default"
                              }
                              size="icon"
                              onClick={() => handleToggleCheckIn(ticket.id)}
                              title={
                                ticket.isCheckedIn
                                  ? "Undo Check-In"
                                  : "Check In"
                              }
                            >
                              {ticket.isCheckedIn ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <TicketCheck className="h-4 w-4" />
                              )}
                            </Button>
                            {user?.role === "admin" && (
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteConfirmation(ticket)}
                                title="Delete Ticket"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-4 border-t pt-4">
          <Button
            onClick={handleExportTable}
            variant="outline"
            disabled={filteredTickets.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Export Table (CSV)
          </Button>
        </CardFooter>
      </Card>

      {qrDialogTicket && (
        <AlertDialog
          open={!!qrDialogTicket}
          onOpenChange={() => setQrDialogTicket(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ticket QR Code</AlertDialogTitle>
              <AlertDialogDescription>
                For Attendee: {qrDialogTicket.userName} (
                {qrDialogTicket.ticketType})
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-center py-4">
              <QrCodeDisplay value={qrDialogTicket.qrCodeValue} size={200} />
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setQrDialogTicket(null)}>
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {ticketToDelete && (
        <AlertDialog
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the ticket for "
                {ticketToDelete.userName}" (ID: {ticketToDelete.qrCodeValue})?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteAlertOpen(false);
                  setTicketToDelete(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={executeDeleteTicket}>
                Delete Ticket
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Sheet
        open={isCreateTicketSheetOpen}
        onOpenChange={setIsCreateTicketSheetOpen}
      >
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Ticket</SheetTitle>
            <SheetDescription>
              Manually create a new ticket for an existing or new user.
            </SheetDescription>
          </SheetHeader>
          <AdminCreateTicketForm
            isOpen={isCreateTicketSheetOpen}
            setIsOpen={setIsCreateTicketSheetOpen}
            allUsers={allUsers}
            allTicketTypes={allTicketTypes}
            onCreateUser={adminCreateUser}
            onCreateTicket={adminCreateTicket}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
