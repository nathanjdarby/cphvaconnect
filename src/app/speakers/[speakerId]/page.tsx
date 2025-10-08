"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../hooks/use-auth";
import type { Speaker, ScheduleEvent, LocationType } from "../../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, CalendarDays, Clock, MapPin, Mic } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function SingleSpeakerPage() {
  const params = useParams();
  const router = useRouter();
  const { allSpeakers, allScheduleEvents, allLocations, loading } = useAuth();
  const speakerId = params.speakerId as string;

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading speaker details...</p>
      </div>
    );
  }

  const speaker = allSpeakers.find((s) => s.id === speakerId);

  if (!speaker) {
    return (
      <div className="text-center py-20">
        <Mic className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-3">Speaker Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The speaker you are looking for does not exist.
        </p>
        <Button onClick={() => router.push("/speakers")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Speakers
        </Button>
      </div>
    );
  }

  const getLocationName = (locationId?: string): string | undefined => {
    if (!locationId) return undefined;
    return allLocations.find((loc) => loc.id === locationId)?.name;
  };

  const getSpeakerEvents = (currentSpeakerId: string): ScheduleEvent[] => {
    return allScheduleEvents
      .filter((event) => event.speakerIds?.includes(currentSpeakerId))
      .filter(
        (event) =>
          event &&
          typeof event.startTime === "string" &&
          event.startTime.trim() !== ""
      )
      .slice()
      .sort((a, b) => {
        try {
          const timeA = parseISO(a.startTime).getTime();
          const timeB = parseISO(b.startTime).getTime();
          return timeA - timeB;
        } catch (error) {
          console.error(
            `Error parsing startTime for speaker events page. Event A ID: ${a?.id}, startTime: ${a?.startTime}. Event B ID: ${b?.id}, startTime: ${b?.startTime}. Error:`,
            error
          );
          let isAValid = true;
          try {
            parseISO(a.startTime);
          } catch {
            isAValid = false;
          }
          let isBValid = true;
          try {
            parseISO(b.startTime);
          } catch {
            isBValid = false;
          }
          if (!isAValid && isBValid) return 1;
          if (isAValid && !isBValid) return -1;
          return 0;
        }
      });
  };

  const speakerEvents = getSpeakerEvents(speaker.id);

  return (
    <div className="space-y-12">
      <section className="relative py-12 md:py-20 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-lg shadow-xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={
              speaker.imageUrl ||
              `https://placehold.co/1200x400.png?text=${speaker.name.substring(
                0,
                1
              )}`
            }
            alt={`${speaker.name} banner`}
            fill
            className="object-cover opacity-20"
            data-ai-hint={speaker.dataAiHint || "abstract background"}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-card shrink-0">
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={speaker.dataAiHint || "professional person"}
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary">
              {speaker.name}
            </h1>
            <p className="mt-2 text-xl sm:text-2xl font-medium text-accent">
              {speaker.title}
            </p>
          </div>
        </div>
      </section>

      <Button
        onClick={() => router.push("/speakers")}
        variant="outline"
        className="mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Speakers
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Biography</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
            {speaker.bio}
          </p>
        </CardContent>
      </Card>

      {speakerEvents.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">
              Sessions by {speaker.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {speakerEvents.map((event) => {
              const locationName = getLocationName(
                event.locationId || undefined
              );
              return (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg shadow-sm bg-secondary/30"
                >
                  <h3 className="text-xl font-semibold text-primary/90 mb-1 hover:text-primary transition-colors">
                    <Link
                      href={`/schedule/${event.id}`}
                      className="flex items-center"
                    >
                      <CalendarDays className="mr-2 h-5 w-5 text-accent" />
                      {event.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center mb-1">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(parseISO(event.startTime), "EEEE, MMM d, p")} -{" "}
                    {format(parseISO(event.endTime), "p")}
                  </p>
                  {locationName && (
                    <p className="text-sm text-muted-foreground flex items-center mb-2">
                      <MapPin className="mr-2 h-4 w-4" /> Location:{" "}
                      {locationName}
                    </p>
                  )}
                  <p className="text-sm text-foreground/80 line-clamp-3">
                    {event.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
