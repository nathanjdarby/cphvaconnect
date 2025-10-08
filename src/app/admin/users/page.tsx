
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import type { User } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../../components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { UserForm } from '../../../components/admin/user-form';
import { PlusCircle, Trash2, ShieldAlert, UsersRound, Filter } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

type UserRole = User['role'];

export default function AdminUsersPage() {
  const { user, loading, allUsers, updateUserRole, deleteUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const authorizedRoles: UserRole[] = ['admin'];

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      toast({ title: 'User Role Updated' });
    }
  };

  const handleDeleteConfirmation = (userId: string) => {
    setUserToDeleteId(userId);
    setIsAlertOpen(true);
  };

  const executeDeleteUser = async () => {
    if (userToDeleteId) {
      const success = await deleteUser(userToDeleteId);
      if (success) {
        toast({ title: 'User Deleted' });
      }
      setUserToDeleteId(null);
      setIsAlertOpen(false);
    }
  };

  const roleOrder: Record<UserRole, number> = {
    admin: 1,
    organiser: 2,
    attendee: 3,
  };

  const filteredAndSortedUsers = useMemo(() => {
    let usersToDisplay = [...(allUsers || [])];
    if (roleFilter !== 'all') {
      usersToDisplay = usersToDisplay.filter(u => u.role === roleFilter);
    }
    return usersToDisplay.sort((a, b) => {
      const roleComparison = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
      if (roleComparison !== 0) return roleComparison;
      return a.name.localeCompare(b.name);
    });
  }, [allUsers, roleFilter]);

  if (loading) {
    return <div className="text-center py-10"><p>Loading user management...</p></div>;
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
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <UsersRound className="mr-3 h-8 w-8 text-accent" />
              Manage Users
            </CardTitle>
            <CardDescription>View, edit roles, and delete users.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="organiser">Organiser</SelectItem>
                  <SelectItem value="attendee">Attendee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsSheetOpen(true)} size="lg" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {roleFilter === 'all' ? 'No users found.' : `No users found with the role: ${roleFilter}.`}
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableCaption>
                  A list of all registered users. {filteredAndSortedUsers.length} user(s) displayed.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Name</TableHead>
                    <TableHead className="w-[35%]">Email</TableHead>
                    <TableHead className="w-[20%] min-w-[180px]">Role</TableHead>
                    <TableHead className="w-[15%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <Link href={`/users/${u.id}`} className="hover:underline text-primary">
                          {u.name}
                        </Link>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={(newRole) => handleRoleChange(u.id, newRole as UserRole)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attendee">Attendee</SelectItem>
                            <SelectItem value="organiser">Organiser</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteConfirmation(u.id)}
                          disabled={user?.id === u.id || (u.role === 'admin' && allUsers.filter(usr => usr.role === 'admin').length <= 1)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <SheetDescription>
              Fill in the details for the new user.
            </SheetDescription>
          </SheetHeader>
          <UserForm isOpen={isSheetOpen} setIsOpen={setIsSheetOpen} />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and all their associated tickets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteUser}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
