
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import type { User, Ticket } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, UserCircle, Mail, Ticket as TicketIcon, ShieldAlert, Edit3, Eye, EyeOff, BookUser } from 'lucide-react';
import TicketCard from '../../../components/ticket/ticket-card';
import { useEffect, useState } from 'react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, allUsers, allTickets, loading } = useAuth();
  const userId = params.userId as string;

  const [profileUser, setProfileUser] = useState<User | null | undefined>(undefined); // undefined for initial, null if not found
  const [userPurchasedTickets, setUserPurchasedTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!loading) {
      const foundUser = allUsers && Array.isArray(allUsers) ? allUsers.find(u => u.id === userId) : undefined;
      setProfileUser(foundUser || null);

      if (foundUser) {
        const ticketsForUser = allTickets && Array.isArray(allTickets) ? allTickets.filter(ticket => ticket.userId === foundUser.id) : [];
        setUserPurchasedTickets(ticketsForUser);
      } else {
        setUserPurchasedTickets([]);
      }
    }
  }, [userId, allUsers, allTickets, loading]);


  if (loading || profileUser === undefined) {
    return <div className="text-center py-10"><p>Loading user profile...</p></div>;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <UserCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-3">User Not Found</h1>
        <p className="text-muted-foreground mb-6">The user profile you are looking for does not exist.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  const canViewFullProfile = currentUser && (currentUser.id === profileUser.id || currentUser.role === 'admin');
  const canViewName = canViewFullProfile || profileUser.nameIsPublic;
  const canViewEmail = (canViewFullProfile === true) || (profileUser.emailIsPublic === true);
  const canViewBio = canViewFullProfile || (profileUser.nameIsPublic && profileUser.bio);


  if (!canViewName && !canViewEmail && !canViewBio && !canViewFullProfile) {
     return (
      <div className="text-center py-20">
        <ShieldAlert className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-3">Profile is Private</h1>
        <p className="text-muted-foreground mb-6">This user has chosen to keep their profile details private.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {currentUser && currentUser.id === profileUser.id && (
           <Button asChild>
            <Link href="/profile/edit">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Link>
          </Button>
        )}
      </div>

      <Card className="shadow-xl">
        <CardHeader className="bg-primary/10 dark:bg-primary/20">
          <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-4xl font-bold text-primary flex items-center">
                    <UserCircle className="mr-3 h-10 w-10 text-accent" />
                    {canViewName ? profileUser.name : "[Name Withheld]"}
                </CardTitle>
                {canViewEmail ? (
                    <CardDescription className="text-md flex items-center mt-1 text-foreground/80">
                        <Mail className="mr-2 h-5 w-5 text-muted-foreground" /> {profileUser.email}
                    </CardDescription>
                ) : (
                    <CardDescription className="text-md flex items-center mt-1 text-muted-foreground italic">
                        <EyeOff className="mr-2 h-5 w-5" /> [Email Withheld]
                    </CardDescription>
                )}
                {currentUser?.role === 'admin' && (
                    <p className="text-xs text-muted-foreground mt-1">Role: {profileUser.role}</p>
                )}
            </div>
            {!canViewFullProfile && (
                <div className="text-xs text-muted-foreground space-y-1 text-right">
                    {profileUser.nameIsPublic !== undefined && (
                        <span className={`flex items-center justify-end ${profileUser.nameIsPublic ? 'text-green-600' : 'text-red-600'}`}>
                            {profileUser.nameIsPublic ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />} Name Public
                        </span>
                    )}
                    {profileUser.emailIsPublic !== undefined && (
                        <span className={`flex items-center justify-end ${profileUser.emailIsPublic ? 'text-green-600' : 'text-red-600'}`}>
                            {profileUser.emailIsPublic ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />} Email Public
                        </span>
                    )}
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {canViewBio && profileUser.bio && (
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-2 flex items-center">
                <BookUser className="mr-2 h-6 w-6 text-accent" />
                Bio
              </h2>
              <p className="text-foreground/90 whitespace-pre-line leading-relaxed">{profileUser.bio}</p>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
              <TicketIcon className="mr-2 h-6 w-6 text-accent" />
              Purchased Tickets
            </h2>
            {userPurchasedTickets.length === 0 ? (
              <div className="text-center py-6 bg-muted/50 rounded-md">
                <p className="text-muted-foreground">This user has not purchased any tickets yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPurchasedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
