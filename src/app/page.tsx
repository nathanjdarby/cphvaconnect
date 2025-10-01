"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CalendarDays,
  Users,
  Ticket,
  Clock,
  Zap,
  UserCircle,
  PlayCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { ScheduleEvent, Speaker as SpeakerType } from "@/types";
import { format, parseISO } from "date-fns";
import { useState, useEffect, useMemo, useCallback } from "react";

// Helper function to check if an event is currently active
const isEventActive = (event: ScheduleEvent, now: Date): boolean => {
  if (!event.startTime || !event.endTime) return false;
  try {
    const startTime = parseISO(event.startTime);
    const endTime = parseISO(event.endTime);
    return now >= startTime && now <= endTime;
  } catch (e) {
    return false;
  }
};

export default function HomePage() {
  const {
    allSpeakers,
    loading: speakersLoading,
    allScheduleEvents,
    allLocations,
  } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update current time every minute
    return () => clearInterval(timer);
  }, []);

  const displayedSpeakers = useMemo(() => {
    return speakersLoading ? [] : (allSpeakers || []).slice(0, 3);
  }, [speakersLoading, allSpeakers]);

  const getSpeakerEvents = useCallback(
    (speakerId: string): ScheduleEvent[] => {
      if (speakersLoading || !allScheduleEvents) return [];
      return allScheduleEvents
        .filter((event) => event.speakerIds?.includes(speakerId))
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
    },
    [allScheduleEvents, speakersLoading]
  );

  const currentActiveEvent = useMemo(() => {
    if (!allScheduleEvents || allScheduleEvents.length === 0) return null;
    const sortedEvents = [...allScheduleEvents]
      .filter(
        (event) =>
          event &&
          typeof event.startTime === "string" &&
          event.startTime.trim() !== ""
      )
      .sort((a, b) => {
        try {
          return (
            parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
          );
        } catch {
          return 0;
        }
      });
    return (
      sortedEvents.find((event) => isEventActive(event, currentTime)) || null
    );
  }, [allScheduleEvents, currentTime]);

  const getSpeakerObjectsForEvent = useCallback(
    (speakerIds?: string[]): SpeakerType[] => {
      if (!speakerIds || !allSpeakers || allSpeakers.length === 0) return [];
      return speakerIds
        .map((id) => allSpeakers.find((s) => s.id === id))
        .filter(Boolean) as SpeakerType[];
    },
    [allSpeakers]
  );

  const getLocationName = useCallback(
    (locationId?: string): string | undefined => {
      if (!locationId || !allLocations) return undefined;
      return allLocations.find((loc) => loc.id === locationId)?.name;
    },
    [allLocations]
  );

  const activeEventSpeakers = useMemo(() => {
    if (currentActiveEvent && currentActiveEvent.speakerIds) {
      return getSpeakerObjectsForEvent(currentActiveEvent.speakerIds);
    }
    return [];
  }, [currentActiveEvent, getSpeakerObjectsForEvent]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-lg shadow-lg">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl">
          CPHVA Annual Professional Conference 2025
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-foreground/80 sm:text-xl px-2">
          The Importance of Public Health: Early Steps to Strong Futures -
          Celebrating our profession
        </p>
      </section>

      {/* Active Event Section */}
      {currentActiveEvent && (
        <section className="mb-12 p-6 bg-green-600/10 dark:bg-green-400/20 text-green-700 dark:text-green-300 rounded-lg shadow-lg border border-green-600/30">
          <div className="flex items-center mb-3">
            <Zap className="h-7 w-7 mr-3 animate-pulse text-green-600" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
              Happening Now!
            </h2>
          </div>
          <Card className="shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                <Link
                  href={`/schedule/${currentActiveEvent.id}`}
                  className="hover:underline"
                >
                  {currentActiveEvent.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-sm flex flex-wrap items-center text-muted-foreground gap-x-2">
                <span className="flex items-center">
                  <Clock className="mr-1.5 h-4 w-4" />
                  {format(parseISO(currentActiveEvent.startTime), "p")} -{" "}
                  {format(parseISO(currentActiveEvent.endTime), "p")}
                </span>
                {getLocationName(
                  currentActiveEvent.locationId || undefined
                ) && (
                  <span className="flex items-center border-l pl-2">
                    Location:{" "}
                    {getLocationName(
                      currentActiveEvent.locationId || undefined
                    )}
                  </span>
                )}
              </CardDescription>
            </CardHeader>

            {activeEventSpeakers.length > 0 && (
              <CardContent className="pt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Speakers:
                </h4>
                <div className="flex flex-wrap gap-4">
                  {activeEventSpeakers.map((speaker) => (
                    <Link
                      key={speaker.id}
                      href={`/speakers/${speaker.id}`}
                      className="group flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-md transition-colors"
                    >
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-primary/50 group-hover:border-accent">
                        <Image
                          src={
                            speaker.imageUrl ||
                            `https://placehold.co/80x80.png?text=${speaker.name.substring(
                              0,
                              1
                            )}`
                          }
                          alt={speaker.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                          data-ai-hint={speaker.dataAiHint || "person"}
                        />
                      </div>
                      <span className="text-sm font-medium text-primary group-hover:text-accent">
                        {speaker.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            )}
            <CardFooter className="pt-4">
              <Button asChild variant="link" className="p-0 h-auto text-sm">
                <Link href={`/schedule/${currentActiveEvent.id}`}>
                  View Event Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {/* About Section */}
      <section className="py-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-primary">
              About CPHVA Conference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center text-foreground/90 leading-relaxed max-w-3xl mx-auto">
              CPHVA is taking its Annual Professional Conference this year to
              the vibrant city of Bristol! From street art and live music to
              diverse cultural festivals, Bristol provides a thriving creative
              scene, complimented by its mix of green spaces, strong tech hub
              and dynamic nightlife to create a unique blend of modern
              innovation and historic charm.
            </p>
            <p className="text-lg text-center text-foreground/90 leading-relaxed max-w-3xl mx-auto mt-4">
              We hope that Bristol combined with the Conference will provide a
              stimulating education platform with interactive networking and
              experiential learning to enrich your Knowledge, Skills and
              Practice counting towards your Continuous Personal and
              Professional Development.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-secondary rounded-lg shadow">
                <Users className="h-12 w-12 mx-auto text-secondary-foreground mb-3" />
                <h3 className="text-xl font-semibold text-secondary-foreground">
                  Expert Speakers
                </h3>
                <p className="text-sm text-secondary-foreground/80">
                  Learn from the best minds in the industry.
                </p>
              </div>
              <div className="p-6 bg-secondary rounded-lg shadow">
                <CalendarDays className="h-12 w-12 mx-auto text-secondary-foreground mb-3" />
                <h3 className="text-xl font-semibold text-secondary-foreground">
                  Packed Schedule
                </h3>
                <p className="text-sm text-secondary-foreground/80">
                  Engaging sessions and workshops.
                </p>
              </div>
              <div className="p-6 bg-secondary rounded-lg shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-secondary-foreground mb-3"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h3 className="text-xl font-semibold text-secondary-foreground">
                  Networking
                </h3>
                <p className="text-sm text-secondary-foreground/80">
                  Connect with peers and industry leaders.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Video Highlights Section */}
      <section className="py-12">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-primary flex items-center justify-center">
              <PlayCircle className="mr-3 h-8 w-8 text-accent" />
              Conference Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full max-w-5xl mx-auto bg-muted rounded-lg overflow-hidden shadow-inner">
              <video
                className="w-full h-full"
                controls
                src="https://www.dropbox.com/scl/fi/al0rtmj6vo7pn1bcpfb16/CPHVA-APC-24-Highlights.mp4?rlkey=jr8r6eo97dnqyhkhofu1g8c13&st=cycu4nr9&dl=1"
                poster="https://www.dropbox.com/scl/fi/ixahalc1jplgbv4ke2j2j/DSCF0487.jpg?rlkey=djqiv109qa8f35x6e7xn52kv1&st=rzqz3xya&dl=1"
                data-ai-hint="conference highlights"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              A glimpse into the CPHVA APC '24 highlights.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Key Speakers Section */}
      <section className="py-12">
        <h2 className="text-4xl font-bold text-center mb-10 text-primary">
          Meet Our Key Speakers
        </h2>
        {speakersLoading ? (
          <div className="text-center">
            <p className="text-muted-foreground">Loading speakers...</p>
          </div>
        ) : displayedSpeakers.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">
              No speakers to display yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedSpeakers.map((speaker: SpeakerType) => {
              const events = getSpeakerEvents(speaker.id);
              return (
                <Card
                  key={speaker.id}
                  className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full h-auto object-cover cursor-pointer"
                        data-ai-hint={
                          speaker.dataAiHint || "professional person"
                        }
                      />
                    </Link>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <CardTitle className="text-xl md:text-2xl">
                      <Link
                        href={`/speakers/${speaker.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {speaker.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-accent font-medium mt-1 text-sm md:text-base">
                      {speaker.title}
                    </CardDescription>
                    {events.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed space-y-1">
                        <p className="text-sm font-semibold text-primary/80">
                          Session{events.length > 1 ? "s" : ""}:
                        </p>
                        {events.slice(0, 1).map((event) => (
                          <div key={event.id}>
                            <p className="text-sm text-primary/80 hover:text-primary transition-colors">
                              <Link
                                href={`/schedule/${event.id}`}
                                className="flex items-center"
                              >
                                <CalendarDays className="mr-1.5 h-4 w-4 text-muted-foreground" />
                                {event.title}
                              </Link>
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Clock className="mr-1.5 h-3 w-3" />
                              {format(parseISO(event.startTime), "p")} -{" "}
                              {format(parseISO(event.endTime), "p")}
                            </p>
                          </div>
                        ))}
                        {events.length > 1 && (
                          <p className="text-xs text-muted-foreground italic">
                            ...and more.
                          </p>
                        )}
                      </div>
                    )}
                    <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-3">
                      {speaker.bio}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6">
                    <Button variant="link" asChild className="p-0 text-sm">
                      <Link href={`/speakers/${speaker.id}`}>
                        View Full Profile{" "}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        {(allSpeakers || []).length > 0 && (
          <div className="text-center mt-10">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <Link href="/speakers">
                View All Speakers <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
