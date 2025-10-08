"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../hooks/use-auth";
import type { ScheduleEvent, Speaker, LocationType, User } from "../../../types";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
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
import { ScheduleForm } from "../../../components/admin/schedule-form";
import {
  PlusCircle,
  Edit,
  Trash2,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  User as UserIcon,
  ShieldAlert,
  CalendarCog,
  Download,
  Coffee,
  Utensils,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AdminSchedulePage() {
  const {
    user,
    loading,
    allScheduleEvents,
    allSpeakers,
    allLocations,
    deleteScheduleEvent,
  } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState<string | null>(null);

  const authorizedRoles: User["role"][] = ["admin", "organiser"];

  const sortedEvents = useMemo(() => {
    const validEvents = (allScheduleEvents || []).filter(
      (event) =>
        event &&
        typeof event.startTime === "string" &&
        event.startTime.trim() !== ""
    );
    return [...validEvents].sort((a, b) => {
      try {
        return (
          parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
        );
      } catch (error) {
        console.error(
          "Error parsing date for sorting in admin schedule",
          a.startTime,
          b.startTime,
          error
        );
        return 0;
      }
    });
  }, [allScheduleEvents]);

  const getSpeakerObjects = (speakerIds?: string[]): Speaker[] => {
    if (!speakerIds || speakerIds.length === 0 || !allSpeakers) return [];
    return speakerIds
      .map((id) => {
        const speaker = allSpeakers.find((s) => s.id === id);
        return speaker;
      })
      .filter((speaker) => speaker !== undefined) as Speaker[];
  };

  const getLocationName = (locationId?: string): string => {
    if (!locationId || !allLocations) return "N/A";
    return allLocations.find((loc) => loc.id === locationId)?.name || "N/A";
  };

  const handleAddNewEvent = () => {
    setEventToEdit(null);
    setIsSheetOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEventToEdit(event);
    setIsSheetOpen(true);
  };

  const handleDeleteConfirmation = (eventId: string) => {
    setEventToDeleteId(eventId);
    setIsAlertOpen(true);
  };

  const executeDeleteEvent = async () => {
    if (eventToDeleteId) {
      await deleteScheduleEvent(eventToDeleteId);
      setEventToDeleteId(null);
      setIsAlertOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading admin schedule...</p>
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
              <CalendarCog className="mr-3 h-8 w-8 text-accent" />
              Manage Schedule
            </CardTitle>
            <CardDescription>
              Add, edit, or delete conference schedule events.
            </CardDescription>
          </div>
          <Button onClick={handleAddNewEvent} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
          </Button>
        </CardHeader>
        <CardContent>
          {sortedEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No schedule events found. Add one to get started!
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableCaption>
                  A list of all conference schedule events.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Speakers</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map((event) => {
                    const speakerObjects = getSpeakerObjects(event.speakerIds);
                    const isLunchBreak = event.title
                      .toLowerCase()
                      .includes("lunch break");
                    const isRefreshmentBreak = event.title
                      .toLowerCase()
                      .includes("refreshment break");

                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isLunchBreak && (
                              <Utensils className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            )}
                            {isRefreshmentBreak && (
                              <Coffee className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            )}
                            <Link
                              href={`/schedule/${event.id}`}
                              className="hover:underline text-primary"
                            >
                              {event.title}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(event.startTime), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(event.startTime), "p")} -{" "}
                          {format(parseISO(event.endTime), "p")}
                        </TableCell>
                        <TableCell>
                          {getLocationName(event.locationId || undefined)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2 items-center">
                            {speakerObjects.length > 0 ? (
                              speakerObjects.map((speaker) => (
                                <Link
                                  key={speaker.id}
                                  href={`/speakers/${speaker.id}`}
                                  className="group"
                                  title={`View profile of ${speaker.name}`}
                                >
                                  <div className="relative h-10 w-10 rounded-full overflow-hidden shadow-sm border-2 border-transparent group-hover:border-accent">
                                    <Image
                                      src={
                                        speaker.imageUrl ||
                                        `https://placehold.co/40x40.png?text=${speaker.name.substring(
                                          0,
                                          1
                                        )}`
                                      }
                                      alt={speaker.name}
                                      fill
                                      sizes="40px"
                                      className="object-cover group-hover:scale-110 transition-transform duration-200 ease-in-out"
                                      data-ai-hint={
                                        speaker.dataAiHint || "person"
                                      }
                                    />
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                N/A
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.offerDownloads &&
                          event.eventFiles &&
                          event.eventFiles.length > 0 ? (
                            <span className="flex items-center text-sm text-muted-foreground">
                              <Download className="mr-1.5 h-4 w-4 text-accent" />{" "}
                              {event.eventFiles.length}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/70">
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteConfirmation(event.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {eventToEdit ? "Edit Event" : "Add New Event"}
            </SheetTitle>
            <SheetDescription>
              {eventToEdit
                ? "Update the details of this event."
                : "Fill in the details for the new event."}
            </SheetDescription>
          </SheetHeader>
          <ScheduleForm
            isOpen={isSheetOpen}
            setIsOpen={setIsSheetOpen}
            eventToEdit={eventToEdit}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteEvent}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
