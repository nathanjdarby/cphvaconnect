"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import type { ScheduleEvent, Speaker, EventFile } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  User,
  Download,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface GroupedFiles {
  [category: string]: EventFile[];
}

export default function SingleEventPage() {
  const params = useParams();
  const router = useRouter();
  const { allScheduleEvents, allSpeakers, allLocations, loading } = useAuth();
  const eventId = params.eventId as string;

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading event details...</p>
      </div>
    );
  }

  const event = allScheduleEvents.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="text-center py-20">
        <CalendarDays className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-3">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The event you are looking for does not exist.
        </p>
        <Button onClick={() => router.push("/schedule")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Full Schedule
        </Button>
      </div>
    );
  }

  const getSpeakerObjects = (speakerIds?: string[]): Speaker[] => {
    if (!speakerIds || speakerIds.length === 0 || !allSpeakers) return [];
    return speakerIds
      .map((id) => {
        const speaker = allSpeakers.find((s) => s.id === id);
        return speaker;
      })
      .filter((speaker) => speaker !== undefined) as Speaker[];
  };

  const getLocationName = (locationId?: string): string | undefined => {
    if (!locationId || !allLocations) return undefined;
    return allLocations.find((loc) => loc.id === locationId)?.name;
  };

  const speakerObjects = getSpeakerObjects(event.speakerIds);
  const SpeakerSectionIcon = speakerObjects.length > 1 ? Users : User;
  const locationName = getLocationName(event.locationId || undefined);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const groupedEventFiles = event.eventFiles?.reduce((acc, file) => {
    const category = file.category?.trim() || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(file);
    return acc;
  }, {} as GroupedFiles);

  return (
    <div className="space-y-8">
      <Button
        onClick={() => router.push("/schedule")}
        variant="outline"
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Full Schedule
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="bg-primary/10 dark:bg-primary/20">
          <CardTitle className="text-4xl font-bold text-primary flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-accent" />
            {event.title}
          </CardTitle>
          <CardDescription className="text-lg flex items-center mt-2 text-foreground/80">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            {format(parseISO(event.startTime), "EEEE, MMMM d, yyyy")}
            <span className="mx-2">|</span>
            {format(parseISO(event.startTime), "p")} -{" "}
            {format(parseISO(event.endTime), "p")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <p className="text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>

          {speakerObjects.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-primary/90 mb-4 flex items-center">
                <SpeakerSectionIcon className="mr-2 h-6 w-6 text-accent" />
                Speaker{speakerObjects.length > 1 ? "s" : ""}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {speakerObjects.map((speaker) => (
                  <Link
                    key={speaker.id}
                    href={`/speakers/${speaker.id}`}
                    className="group block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-card"
                  >
                    <div className="relative w-full aspect-[4/3] bg-muted h-32">
                      <Image
                        src={
                          speaker.imageUrl ||
                          `https://placehold.co/400x300.png?text=${speaker.name.substring(
                            0,
                            1
                          )}`
                        }
                        alt={speaker.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                        data-ai-hint={
                          speaker.dataAiHint || "professional person"
                        }
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-lg text-primary group-hover:underline truncate">
                        {speaker.name}
                      </p>
                      <p className="text-sm text-accent truncate">
                        {speaker.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {locationName && (
            <div>
              <h3 className="text-xl font-semibold text-primary/90 mb-1 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-accent" /> Location
              </h3>
              <p className="text-md text-foreground/80">{locationName}</p>
            </div>
          )}
        </CardContent>
        {event.offerDownloads &&
          groupedEventFiles &&
          Object.keys(groupedEventFiles).length > 0 && (
            <CardFooter className="flex-col items-start pt-6 border-t mt-4">
              <h3 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                <Download className="mr-2 h-6 w-6 text-accent" />
                Downloads
              </h3>
              <div className="w-full space-y-4">
                {Object.entries(groupedEventFiles)
                  .sort(([catA], [catB]) => catA.localeCompare(catB))
                  .map(([category, files]) => (
                    <div key={category}>
                      <h4 className="text-lg font-medium text-primary/80 mb-2 border-b pb-1">
                        {category}
                      </h4>
                      <ul className="space-y-2 pl-2">
                        {files.map((file) => (
                          <li key={file.id} className="text-md">
                            {file.storageUrl &&
                            file.storageUrl.startsWith("http") ? (
                              <a
                                href={file.storageUrl}
                                download={file.name} // Suggests filename to browser
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-primary hover:underline hover:text-primary/80 transition-colors"
                              >
                                <Paperclip className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({formatFileSize(file.size)})
                                </span>
                              </a>
                            ) : (
                              <span className="flex items-center text-muted-foreground italic">
                                <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                                {file.name} ({formatFileSize(file.size)}) - File
                                not available for download. (Requires Firebase
                                Storage setup for uploaded files to be
                                persistent).
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Note: To make uploaded files persistently downloadable, Firebase
                Storage must be fully integrated. Currently, only external URLs
                are guaranteed to work across sessions.
              </p>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}
