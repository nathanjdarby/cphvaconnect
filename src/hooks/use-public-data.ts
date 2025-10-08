import { useState, useEffect } from "react";
import { publicApiService } from "../lib/public-api";
import type {
  ScheduleEvent,
  Speaker,
  ExhibitorType,
  LocationType,
} from "../types";

export function usePublicData() {
  const [loading, setLoading] = useState(true);
  const [allScheduleEvents, setAllScheduleEvents] = useState<ScheduleEvent[]>(
    []
  );
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [allExhibitors, setAllExhibitors] = useState<ExhibitorType[]>([]);
  const [allLocations, setAllLocations] = useState<LocationType[]>([]);

  const loadPublicData = async () => {
    try {
      setLoading(true);
      const [scheduleEvents, speakers, exhibitors, locations] =
        await Promise.all([
          publicApiService.getPublicScheduleEvents(),
          publicApiService.getPublicSpeakers(),
          publicApiService.getPublicExhibitors(),
          publicApiService.getPublicLocations(),
        ]);

      setAllScheduleEvents(scheduleEvents);
      setAllSpeakers(speakers);
      setAllExhibitors(exhibitors);
      setAllLocations(locations);
    } catch (error) {
      console.error("Error loading public data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, []);

  return {
    loading,
    allScheduleEvents,
    allSpeakers,
    allExhibitors,
    allLocations,
    refreshData: loadPublicData,
  };
}
