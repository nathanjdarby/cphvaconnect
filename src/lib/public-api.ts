// Public API service for non-authenticated users
// This provides access to public conference data without requiring login
import { ScheduleEvent, Speaker, ExhibitorType, LocationType } from "../types";
import { mockApiService } from "./mock-api";

class PublicApiService {
  // Get all public schedule events
  async getPublicScheduleEvents(): Promise<ScheduleEvent[]> {
    return await mockApiService.getAllEvents();
  }

  // Get all public speakers
  async getPublicSpeakers(): Promise<Speaker[]> {
    return await mockApiService.getAllSpeakers();
  }

  // Get all public exhibitors
  async getPublicExhibitors(): Promise<ExhibitorType[]> {
    return await mockApiService.getAllExhibitors();
  }

  // Get all public locations
  async getPublicLocations(): Promise<LocationType[]> {
    return await mockApiService.getAllLocations();
  }

  // Get a specific speaker by ID
  async getPublicSpeakerById(id: string): Promise<Speaker | null> {
    return await mockApiService.getSpeakerById(id);
  }

  // Get a specific schedule event by ID
  async getPublicScheduleEventById(id: string): Promise<ScheduleEvent | null> {
    return await mockApiService.getEventById(id);
  }

  // Get a specific exhibitor by ID
  async getPublicExhibitorById(id: string): Promise<ExhibitorType | null> {
    return await mockApiService.getExhibitorById(id);
  }
}

export const publicApiService = new PublicApiService();
