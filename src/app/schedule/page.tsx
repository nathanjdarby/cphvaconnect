"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  CalendarDays,
  Clock,
  MapPin,
  Download,
  Users,
  User,
  Coffee,
  Utensils,
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import type { ScheduleEvent, Speaker, LocationType } from "../../types";
import { format, parseISO, isSameDay, isToday, isTomorrow } from "date-fns";

// Helper function to check if an event is currently active
const isEventActive = (event: ScheduleEvent, now: Date): boolean => {
  if (!event.startTime || !event.endTime) return false;
  try {
    const startTime = parseISO(event.startTime);
    const endTime = parseISO(event.endTime);
    return now >= startTime && now <= endTime;
  } catch (e) {
    // console.error("Error parsing event times for active check:", event.id, e);
    return false;
  }
};

export default function SchedulePage() {
  const { allScheduleEvents, loading, allSpeakers, allLocations } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update current time every minute
    return () => clearInterval(timer);
  }, []);

  const getSpeakerObjects = useCallback(
    (speakerIds?: string[]): Speaker[] => {
      if (!speakerIds || speakerIds.length === 0 || !allSpeakers) return [];
      return speakerIds
        .map((id) => {
          const speaker = allSpeakers.find((s) => s.id === id);
          return speaker;
        })
        .filter((speaker) => speaker !== undefined) as Speaker[];
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

  const dailyGroupedEvents = useMemo(() => {
    if (loading || !allScheduleEvents) return [];

    const eventsForSorting = (allScheduleEvents || []).filter(
      (event) =>
        event &&
        typeof event.startTime === "string" &&
        event.startTime.trim() !== ""
    );

    const initialSortedEvents = [...eventsForSorting].sort((a, b) => {
      try {
        const timeA = parseISO(a.startTime).getTime();
        const timeB = parseISO(b.startTime).getTime();
        return timeA - timeB;
      } catch (error) {
        console.error(
          `Error parsing date string during sort in public schedule. ` +
            `EventA ID: ${a.id}, startTime: "${a.startTime}". ` +
            `EventB ID: ${b.id}, startTime: "${b.startTime}". Error: ${error}`
        );
        return 0;
      }
    });

    const groupEventsByDay = (events: ScheduleEvent[]) => {
      if (events.length === 0) return [];
      const grouped: {
        date: Date;
        dayLabel: string;
        events: ScheduleEvent[];
      }[] = [];
      let currentDayGroup: {
        date: Date;
        dayLabel: string;
        events: ScheduleEvent[];
      } | null = null;

      events.forEach((event) => {
        try {
          const eventDate = parseISO(event.startTime);
          if (!currentDayGroup || !isSameDay(eventDate, currentDayGroup.date)) {
            let dayLabel: string;
            if (isToday(eventDate)) {
              dayLabel = "Today";
            } else if (isTomorrow(eventDate)) {
              dayLabel = "Tomorrow";
            } else {
              dayLabel = format(eventDate, "EEEE, MMMM d, yyyy");
            }
            currentDayGroup = { date: eventDate, dayLabel, events: [event] };
            grouped.push(currentDayGroup);
          } else {
            currentDayGroup.events.push(event);
          }
        } catch (error) {
          console.error(
            `Failed to parse startTime for grouping event ID ${event.id}: ${event.startTime}`,
            error
          );
        }
      });
      return grouped;
    };

    const groupedByDay = groupEventsByDay(initialSortedEvents);

    return groupedByDay.map((dayGroup) => ({
      ...dayGroup,
      events: dayGroup.events
        .map((event) => ({
          ...event,
          isActive: isEventActive(event, currentTime),
        }))
        .sort((a, b) => {
          const aIsActive = (a as ScheduleEvent & { isActive: boolean })
            .isActive;
          const bIsActive = (b as ScheduleEvent & { isActive: boolean })
            .isActive;

          if (aIsActive && !bIsActive) return -1;
          if (!aIsActive && bIsActive) return 1;

          try {
            return (
              parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
            );
          } catch {
            return 0;
          }
        }),
    }));
  }, [allScheduleEvents, loading, currentTime]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-primary">Conference Schedule</h1>
        <p className="mt-2 text-lg text-foreground/80">
          Plan your days at CPHVA Connect.
        </p>
      </section>

      {dailyGroupedEvents.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">
              {(allScheduleEvents || []).length === 0
                ? "The schedule is being finalized or no events have been added yet. Please check back soon!"
                : "No valid schedule events to display. Please check back soon!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {dailyGroupedEvents.map((dayGroup, index) => (
            <div key={`day-${index}`}>
              <h2 className="text-3xl font-semibold text-primary/90 mb-6 pb-2 border-b-2 border-primary/30">
                {dayGroup.dayLabel}
              </h2>
              <div className="space-y-6">
                {(
                  dayGroup.events as (ScheduleEvent & { isActive: boolean })[]
                ).map((event) => {
                  const speakerObjects = getSpeakerObjects(event.speakerIds);
                  const locationName = getLocationName(
                    event.locationId || undefined
                  );
                  const isLunchBreak = event.title
                    .toLowerCase()
                    .includes("lunch break");
                  const isRefreshmentBreak = event.title
                    .toLowerCase()
                    .includes("refreshment break");
                  const isBreak = isLunchBreak || isRefreshmentBreak;

                  let cardBgClass =
                    "shadow-lg hover:shadow-xl transition-shadow";
                  if (isBreak) {
                    cardBgClass += " bg-amber-50 dark:bg-amber-900/30";
                  }

                  return (
                    <Card
                      key={event.id}
                      className={`${cardBgClass} flex flex-col relative overflow-hidden`}
                    >
                      {event.isActive && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 animate-pulse flex items-center">
                          <span className="relative flex h-2.5 w-2.5 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          ACTIVE
                        </div>
                      )}
                      <CardHeader className="pt-6">
                        <CardTitle className="text-2xl text-primary hover:text-primary/80 transition-colors">
                          <Link
                            href={`/schedule/${event.id}`}
                            className="flex items-center"
                          >
                            {isBreak ? (
                              isLunchBreak ? (
                                <Utensils className="mr-3 h-6 w-6 text-amber-600 flex-shrink-0" />
                              ) : (
                                <Coffee className="mr-3 h-6 w-6 text-amber-600 flex-shrink-0" />
                              )
                            ) : (
                              <CalendarDays className="mr-3 h-6 w-6 text-accent flex-shrink-0" />
                            )}
                            {event.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-md flex items-center mt-1">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {format(parseISO(event.startTime), "p")} -{" "}
                          {format(parseISO(event.endTime), "p")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-grow">
                        <p className="text-foreground/90 line-clamp-3">
                          {event.description}
                        </p>

                        {speakerObjects.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h4 className="text-md font-semibold text-primary/80 mb-2 flex items-center">
                              <Users className="mr-2 h-5 w-5 text-accent flex-shrink-0" />{" "}
                              Speaker{speakerObjects.length > 1 ? "s" : ""}:
                            </h4>
                            <div className="flex flex-wrap gap-2 items-center">
                              {speakerObjects.map((speaker) => (
                                <Link
                                  key={speaker.id}
                                  href={`/speakers/${speaker.id}`}
                                  className="group"
                                  title={`View profile of ${speaker.name}`}
                                >
                                  <div className="relative h-24 w-24 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border-2 border-transparent group-hover:border-accent">
                                    <Image
                                      src={
                                        speaker.imageUrl ||
                                        `https://placehold.co/96x96.png?text=${speaker.name.substring(
                                          0,
                                          1
                                        )}`
                                      }
                                      alt={speaker.name}
                                      fill
                                      sizes="96px"
                                      className="object-cover group-hover:scale-110 transition-transform duration-200 ease-in-out"
                                      data-ai-hint={
                                        speaker.dataAiHint ||
                                        "professional person"
                                      }
                                    />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm mt-3 pt-3 border-t">
                          {locationName && (
                            <p className="text-muted-foreground flex items-center">
                              <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />{" "}
                              Location: {locationName}
                            </p>
                          )}
                          {event.offerDownloads &&
                            event.eventFiles &&
                            event.eventFiles.length > 0 && (
                              <p className="text-muted-foreground flex items-center">
                                <Download className="mr-2 h-4 w-4 text-accent flex-shrink-0" />
                                {event.eventFiles.length} download
                                {event.eventFiles.length > 1 ? "s" : ""}{" "}
                                available
                              </p>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
