
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import Image from 'next/image';
import { useAuth } from '../../../hooks/use-auth';
import type { ExhibitorType, User } from '../../../types'; // Added User
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
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
} from '@/components/ui/alert-dialog';
import { ExhibitorForm } from '@/components/admin/exhibitor-form';
import { PlusCircle, Edit, Trash2, ShieldAlert, Construction, ExternalLink, MapPin } from 'lucide-react';

export default function AdminExhibitorsPage() {
  const { user, loading, allExhibitors, deleteExhibitor } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [exhibitorToEdit, setExhibitorToEdit] = useState<ExhibitorType | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [exhibitorToDeleteId, setExhibitorToDeleteId] = useState<string | null>(null);

  const authorizedRoles: User['role'][] = ['admin', 'organiser']; // Updated roles

  const sortedExhibitors = useMemo(() => {
    return [...(allExhibitors || [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [allExhibitors]);

  const handleAddNewExhibitor = () => {
    setExhibitorToEdit(null);
    setIsSheetOpen(true);
  };

  const handleEditExhibitor = (exhibitor: ExhibitorType) => {
    setExhibitorToEdit(exhibitor);
    setIsSheetOpen(true);
  };

  const handleDeleteConfirmation = (exhibitorId: string) => {
    setExhibitorToDeleteId(exhibitorId);
    setIsAlertOpen(true);
  };

  const executeDeleteExhibitor = async () => {
    if (exhibitorToDeleteId && deleteExhibitor) { // Added check for deleteExhibitor
      await deleteExhibitor(exhibitorToDeleteId);
      setExhibitorToDeleteId(null);
      setIsAlertOpen(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10"><p>Loading admin exhibitors...</p></div>;
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
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <Construction className="mr-3 h-8 w-8 text-accent" />
              Manage Exhibitors
            </CardTitle>
            <CardDescription>Add, edit, or delete conference exhibitors.</CardDescription>
          </div>
          <Button onClick={handleAddNewExhibitor} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Exhibitor
          </Button>
        </CardHeader>
        <CardContent>
          {sortedExhibitors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No exhibitors found. Add one to get started!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedExhibitors.map((ex) => (
                <Card key={ex.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="p-0 relative aspect-[16/9] bg-muted">
                    <Image
                      src={ex.logoUrl || `https://placehold.co/400x225.png?text=${ex.name.substring(0,3).toUpperCase()}`}
                      alt={`${ex.name} logo`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-2"
                      data-ai-hint={ex.dataAiHint || "company logo"}
                    />
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-xl text-primary">{ex.name}</CardTitle>
                    {ex.boothNumber && (
                      <CardDescription className="text-sm text-accent font-medium flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-muted-foreground" /> Booth: {ex.boothNumber}
                      </CardDescription>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{ex.description}</p>
                  </CardContent>
                  <CardFooter className="border-t p-3 flex flex-col items-start space-y-2">
                    {ex.websiteUrl && (
                      <Button variant="link" asChild className="p-0 h-auto text-xs text-primary hover:underline">
                        <a href={ex.websiteUrl} target="_blank" rel="noopener noreferrer">
                          Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => handleEditExhibitor(ex)}>
                        <Edit className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirmation(ex.id)}>
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{exhibitorToEdit ? 'Edit Exhibitor' : 'Add New Exhibitor'}</SheetTitle>
            <SheetDescription>
              {exhibitorToEdit ? 'Update the details for this exhibitor.' : 'Fill in the details for the new exhibitor.'}
            </SheetDescription>
          </SheetHeader>
          <ExhibitorForm
            isOpen={isSheetOpen}
            setIsOpen={setIsSheetOpen}
            exhibitorToEdit={exhibitorToEdit}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exhibitor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteExhibitor}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
