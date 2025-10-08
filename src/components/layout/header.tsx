
"use client";

import Link from 'next/link';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Home, CalendarDays, Ticket, LogIn, LogOut, UserCircle, UserPlus,
  Building2, Mic, Menu, Edit3, HeartPulse,
  UsersRound, Tags, MapPinIcon, BarChart3, QrCode, DollarSign, ListOrdered, Construction, UserCog, CalendarCog, Settings, KeyRound
} from 'lucide-react';
import NavLink from './nav-link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useRouter } from 'next/navigation';
import type { User } from '../../types';
import ActivePollDisplay from '../conference/active-poll-display';

// Simplified CPHVA Logo SVG
const CphvaLogoSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-8 w-8 text-primary" fill="currentColor">
    {/* Stylized figure */}
    <circle cx="75" cy="30" r="10" />
    <path d="M75 40 Q70 60 75 80 Q80 60 75 40 Z" />
    {/* Swoosh */}
    <path d="M20 35 Q50 20 80 35 Q50 50 20 35 Z" fill="currentColor" />
  </svg>
);

export default function Header() {
  const { user, logout, loading, appSettings } = useAuth();
  const router = useRouter();

  const getInitials = (name?: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const isAdmin = user && user.role === 'admin';
  const isOrganiser = user && user.role === 'organiser';
  const canAccessSomeAdminLinks = isAdmin || isOrganiser;

  const getRoleBadgeVariant = (role?: User['role']) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'organiser':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50 print:hidden">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <CphvaLogoSvg />
          <span className="text-2xl font-bold">CPHVA Connect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <NavLink href="/" icon={<Home />}>Home</NavLink>
          <NavLink href="/schedule" icon={<CalendarDays />}>Schedule</NavLink>
          <NavLink href="/speakers" icon={<Mic />}>Speakers</NavLink>
          <NavLink href="/exhibitors" icon={<Building2 />}>Exhibitors</NavLink>
        </nav>

        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
          ) : user ? (
            <>
              {user.role !== 'attendee' && (
                 <Badge
                    variant={getRoleBadgeVariant(user.role)}
                    className="capitalize hidden sm:inline-flex"
                  >
                    {user.role}
                  </Badge>
              )}
             
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="avatar person"/>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                        {user.role !== 'attendee' && (
                         <Badge
                             variant={getRoleBadgeVariant(user.role)}
                             className="capitalize mt-1 self-start sm:hidden"
                         >
                             {user.role}
                         </Badge>
                        )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push(`/users/${user.id}`)} className="w-full cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/profile/edit')} className="w-full cursor-pointer">
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>

                  {canAccessSomeAdminLinks && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Admin Panel</DropdownMenuLabel>
                       
                      {isAdmin && (
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs px-2 py-1.5 text-muted-foreground/80">Administration</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => router.push('/admin/users')} className="w-full cursor-pointer">
                            <UsersRound className="mr-2 h-4 w-4" />
                            <span>Manage Users</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/admin/settings')} className="w-full cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>App Settings</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      )}

                      {(isAdmin || isOrganiser) && (
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs px-2 py-1.5 text-muted-foreground/80">Content Management</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => router.push('/admin/exhibitors')} className="w-full cursor-pointer">
                              <Construction className="mr-2 h-4 w-4" />
                              <span>Manage Exhibitors</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/admin/schedule')} className="w-full cursor-pointer">
                              <CalendarCog className="mr-2 h-4 w-4" />
                              <span>Manage Schedule</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/admin/speakers')} className="w-full cursor-pointer">
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Manage Speakers</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/admin/polls')} className="w-full cursor-pointer">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              <span>Manage Polls</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      )}
                       
                      {(isAdmin || isOrganiser) && (
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs px-2 py-1.5 text-muted-foreground/80">Operations & Sales</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => router.push('/admin/check-in')} className="w-full cursor-pointer">
                            <QrCode className="mr-2 h-4 w-4" />
                            <span>Attendee Check-in</span>
                          </DropdownMenuItem>
                           <DropdownMenuItem onSelect={() => router.push('/admin/attendance')} className="w-full cursor-pointer">
                            <ListOrdered className="mr-2 h-4 w-4" />
                            <span>Attendance Report</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/admin/sales')} className="w-full cursor-pointer">
                            <DollarSign className="mr-2 h-4 w-4" />
                            <span>Ticket Sales</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      )}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="w-full cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </>
          )}
           
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => router.push('/')} className="cursor-pointer"><Home className="mr-2 h-4 w-4" />Home</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/schedule')} className="cursor-pointer"><CalendarDays className="mr-2 h-4 w-4" />Schedule</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/speakers')} className="cursor-pointer"><Mic className="mr-2 h-4 w-4" />Speakers</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/exhibitors')} className="cursor-pointer"><Building2 className="mr-2 h-4 w-4" />Exhibitors</DropdownMenuItem>
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem onSelect={() => router.push(`/users/${user.id}`)} className="cursor-pointer"><UserCircle className="mr-2 h-4 w-4" />My Profile</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push('/profile/edit')} className="cursor-pointer"><Edit3 className="mr-2 h-4 w-4" />Edit Profile</DropdownMenuItem>
                     {canAccessSomeAdminLinks && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Admin Panel</DropdownMenuLabel>
                            {isAdmin && (
                                <>
                                <DropdownMenuItem onSelect={() => router.push('/admin/users')} className="cursor-pointer"><UsersRound className="mr-2 h-4 w-4" />Manage Users</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push('/admin/settings')} className="cursor-pointer"><Settings className="mr-2 h-4 w-4" />App Settings</DropdownMenuItem>
                                </>
                            )}
                             {(isAdmin || isOrganiser) && (
                                <>
                                  <DropdownMenuItem onSelect={() => router.push('/admin/schedule')} className="cursor-pointer"><CalendarCog className="mr-2 h-4 w-4" />Manage Schedule</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => router.push('/admin/speakers')} className="cursor-pointer"><UserCog className="mr-2 h-4 w-4" />Manage Speakers</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => router.push('/admin/exhibitors')} className="cursor-pointer"><Construction className="mr-2 h-4 w-4" />Manage Exhibitors</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => router.push('/admin/polls')} className="cursor-pointer"><BarChart3 className="mr-2 h-4 w-4" />Manage Polls</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => router.push('/admin/check-in')} className="cursor-pointer"><QrCode className="mr-2 h-4 w-4" />Attendee Check-in</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => router.push('/admin/attendance')} className="cursor-pointer"><ListOrdered className="mr-2 h-4 w-4" />Attendance Report</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => router.push('/admin/sales')} className="cursor-pointer"><DollarSign className="mr-2 h-4 w-4" />Ticket Sales</DropdownMenuItem>
                                </>
                             )}
                        </>
                     )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onSelect={() => router.push('/login')} className="cursor-pointer"><LogIn className="mr-2 h-4 w-4" />Login</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push('/signup')} className="cursor-pointer"><UserPlus className="mr-2 h-4 w-4" />Sign up</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {user && user.role === 'attendee' && <ActivePollDisplay />}
    </header>
  );
}
