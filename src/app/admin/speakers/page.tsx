"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import type { Speaker, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SpeakerForm } from "@/components/admin/speaker-form";
import {
  PlusCircle,
  Edit,
  Trash2,
  ShieldAlert,
  Mic,
  UserCog,
  CheckSquare,
  Square,
} from "lucide-react";

export default function AdminSpeakersPage() {
  const { user, loading, allSpeakers, deleteSpeaker, updateSpeaker } =
    useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [speakerToEdit, setSpeakerToEdit] = useState<Speaker | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [speakerToDeleteId, setSpeakerToDeleteId] = useState<string | null>(
    null
  );

  // Bulk edit state
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedSpeakers, setSelectedSpeakers] = useState<Set<string>>(
    new Set()
  );
  const [isBulkEditSheetOpen, setIsBulkEditSheetOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    title: "",
    bio: "",
    imageUrl: "",
    dataAiHint: "",
  });

  const authorizedRoles: User["role"][] = ["admin", "organiser"]; // Updated roles

  const sortedSpeakers = useMemo(() => {
    return [...(allSpeakers || [])].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [allSpeakers]);

  const handleAddNewSpeaker = () => {
    setSpeakerToEdit(null);
    setIsSheetOpen(true);
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    setSpeakerToEdit(speaker);
    setIsSheetOpen(true);
  };

  const handleDeleteConfirmation = (speakerId: string) => {
    setSpeakerToDeleteId(speakerId);
    setIsAlertOpen(true);
  };

  const executeDeleteSpeaker = async () => {
    if (deleteSpeaker) {
      if (speakerToDeleteId) {
        // Single speaker delete
        await deleteSpeaker(speakerToDeleteId);
        setSpeakerToDeleteId(null);
      } else if (selectedSpeakers.size > 0) {
        // Bulk delete
        for (const speakerId of selectedSpeakers) {
          await deleteSpeaker(speakerId);
        }
        setSelectedSpeakers(new Set());
      }
      setIsAlertOpen(false);
    }
  };

  // Bulk edit handlers
  const handleToggleBulkEditMode = () => {
    setIsBulkEditMode(!isBulkEditMode);
    setSelectedSpeakers(new Set());
  };

  const handleSelectAll = () => {
    if (selectedSpeakers.size === sortedSpeakers.length) {
      setSelectedSpeakers(new Set());
    } else {
      setSelectedSpeakers(new Set(sortedSpeakers.map((s) => s.id)));
    }
  };

  const handleSelectSpeaker = (speakerId: string) => {
    const newSelected = new Set(selectedSpeakers);
    if (newSelected.has(speakerId)) {
      newSelected.delete(speakerId);
    } else {
      newSelected.add(speakerId);
    }
    setSelectedSpeakers(newSelected);
  };

  const handleBulkEdit = () => {
    if (selectedSpeakers.size === 0) return;
    setIsBulkEditSheetOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedSpeakers.size === 0) return;
    setIsAlertOpen(true);
  };

  const handleBulkEditSubmit = async () => {
    if (selectedSpeakers.size === 0 || !updateSpeaker) return;

    const updates: Partial<Speaker> = {};
    if (bulkEditData.title.trim()) updates.title = bulkEditData.title;
    if (bulkEditData.bio.trim()) updates.bio = bulkEditData.bio;
    if (bulkEditData.imageUrl.trim()) updates.imageUrl = bulkEditData.imageUrl;
    if (bulkEditData.dataAiHint.trim())
      updates.dataAiHint = bulkEditData.dataAiHint;

    if (Object.keys(updates).length === 0) return;

    // Update each selected speaker
    for (const speakerId of selectedSpeakers) {
      await updateSpeaker(speakerId, updates);
    }

    // Reset state
    setSelectedSpeakers(new Set());
    setBulkEditData({ title: "", bio: "", imageUrl: "", dataAiHint: "" });
    setIsBulkEditSheetOpen(false);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading admin speakers...</p>
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
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <UserCog className="mr-3 h-8 w-8 text-accent" />
              Manage Speakers
            </CardTitle>
            <CardDescription>
              Add, edit, or delete conference speakers.
            </CardDescription>
            {isBulkEditMode && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {selectedSpeakers.size} of {sortedSpeakers.length} selected
                </span>
                {selectedSpeakers.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkEdit}
                    >
                      <Edit className="mr-1 h-3 w-3" /> Bulk Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Bulk Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={isBulkEditMode ? "default" : "outline"}
              onClick={handleToggleBulkEditMode}
              size="lg"
            >
              {isBulkEditMode ? (
                <>
                  <CheckSquare className="mr-2 h-5 w-5" /> Exit Bulk Edit
                </>
              ) : (
                <>
                  <Square className="mr-2 h-5 w-5" /> Bulk Edit
                </>
              )}
            </Button>
            <Button onClick={handleAddNewSpeaker} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Speaker
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedSpeakers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No speakers found. Add one to get started!
            </p>
          ) : (
            <>
              {isBulkEditMode && (
                <div className="mb-4 flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedSpeakers.size === sortedSpeakers.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium">
                    Select All ({sortedSpeakers.length} speakers)
                  </Label>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedSpeakers.map((speaker) => (
                  <Card
                    key={speaker.id}
                    className={`shadow-md hover:shadow-lg transition-shadow flex flex-col ${
                      isBulkEditMode && selectedSpeakers.has(speaker.id)
                        ? "ring-2 ring-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    {isBulkEditMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedSpeakers.has(speaker.id)}
                          onCheckedChange={() =>
                            handleSelectSpeaker(speaker.id)
                          }
                        />
                      </div>
                    )}
                    <CardHeader className="p-0 relative aspect-square">
                      <Link
                        href={`/speakers/${speaker.id}`}
                        aria-label={`View profile of ${speaker.name}`}
                      >
                        <Image
                          src={
                            speaker.imageUrl ||
                            `https://placehold.co/400x400.png?text=${speaker.name.substring(
                              0,
                              1
                            )}`
                          }
                          alt={speaker.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover rounded-t-lg cursor-pointer"
                          data-ai-hint={
                            speaker.dataAiHint || "professional person"
                          }
                        />
                      </Link>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <CardTitle className="text-xl">
                        <Link
                          href={`/speakers/${speaker.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {speaker.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm text-accent font-medium">
                        {speaker.title}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                        {speaker.bio}
                      </p>
                    </CardContent>
                    {!isBulkEditMode && (
                      <CardFooter className="border-t p-3 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSpeaker(speaker)}
                        >
                          <Edit className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteConfirmation(speaker.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {speakerToEdit ? "Edit Speaker" : "Add New Speaker"}
            </SheetTitle>
            <SheetDescription>
              {speakerToEdit
                ? "Update the details for this speaker."
                : "Fill in the details for the new speaker."}
            </SheetDescription>
          </SheetHeader>
          <SpeakerForm
            isOpen={isSheetOpen}
            setIsOpen={setIsSheetOpen}
            speakerToEdit={speakerToEdit}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {speakerToDeleteId ? (
                <>
                  This action cannot be undone. This will permanently delete the
                  speaker and unlink them from any events.
                </>
              ) : (
                <>
                  This action cannot be undone. This will permanently delete{" "}
                  {selectedSpeakers.size} selected speaker
                  {selectedSpeakers.size > 1 ? "s" : ""} and unlink them from
                  any events.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteSpeaker}>
              {speakerToDeleteId
                ? "Delete Speaker"
                : `Delete ${selectedSpeakers.size} Speakers`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Edit Sheet */}
      <Sheet open={isBulkEditSheetOpen} onOpenChange={setIsBulkEditSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bulk Edit Speakers</SheetTitle>
            <SheetDescription>
              Update {selectedSpeakers.size} selected speakers. Leave fields
              empty to keep existing values.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-title">Title</Label>
              <Input
                id="bulk-title"
                placeholder="e.g., Professor, CEO, Director"
                value={bulkEditData.title}
                onChange={(e) =>
                  setBulkEditData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-bio">Bio</Label>
              <Textarea
                id="bulk-bio"
                placeholder="Speaker biography..."
                value={bulkEditData.bio}
                onChange={(e) =>
                  setBulkEditData((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-image">Image URL</Label>
              <Input
                id="bulk-image"
                placeholder="https://example.com/image.jpg"
                value={bulkEditData.imageUrl}
                onChange={(e) =>
                  setBulkEditData((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-ai-hint">AI Hint</Label>
              <Input
                id="bulk-ai-hint"
                placeholder="e.g., professional woman, academic man"
                value={bulkEditData.dataAiHint}
                onChange={(e) =>
                  setBulkEditData((prev) => ({
                    ...prev,
                    dataAiHint: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsBulkEditSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkEditSubmit}>
                Update {selectedSpeakers.size} Speakers
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
