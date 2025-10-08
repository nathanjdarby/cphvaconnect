
import type { Ticket } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import QrCodeDisplay from './qr-code-display';
import { Ticket as TicketIcon, Calendar, UserCircle, BadgeDollarSign } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow w-full max-w-sm mx-auto">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg p-4">
        <div className="flex items-center space-x-3">
          <TicketIcon className="h-8 w-8" />
          <div>
            <CardTitle className="text-xl">{ticket.conferenceName}</CardTitle>
            <CardDescription className="text-primary-foreground/80">{ticket.ticketType}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium">ATTENDEE</p>
            <p className="text-lg font-semibold text-foreground flex items-center">
              <UserCircle className="mr-2 h-5 w-5 text-muted-foreground" />
              {ticket.userName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">PURCHASE DATE</p>
            <p className="text-sm text-foreground flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              {new Date(ticket.purchaseDate).toLocaleDateString()}
            </p>
          </div>
           {ticket.ticketPrice !== undefined && (
             <div>
                <p className="text-xs text-muted-foreground font-medium">PRICE PAID</p>
                <p className="text-sm text-foreground flex items-center">
                  <BadgeDollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  £{ticket.ticketPrice.toFixed(2)}
                </p>
            </div>
           )}
           <div>
            <p className="text-xs text-muted-foreground font-medium">TICKET ID</p>
            <p className="text-sm text-foreground break-all">{ticket.qrCodeValue}</p>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <QrCodeDisplay value={ticket.qrCodeValue} size={120} />
        </div>
      </CardContent>
    </Card>
  );
}
