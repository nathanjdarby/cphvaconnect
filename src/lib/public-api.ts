// Public API service for non-authenticated users
// This provides access to public conference data without requiring login
import { ScheduleEvent, Speaker, ExhibitorType, LocationType } from "../types";
import { mockApiService } from "./mock-api";

// Check if we should use real database
const USE_REAL_DB = process.env.NEXT_PUBLIC_USE_REAL_DATABASE === 'true' || 
                    (typeof window === 'undefined' && process.env.USE_REAL_DATABASE === 'true');

class PublicApiService {
  // Get all public schedule events
  async getPublicScheduleEvents(): Promise<ScheduleEvent[]> {
    if (USE_REAL_DB) {
      // For real database, we need to make an API call since this runs on client side
      try {
        const response = await fetch('/api/public/schedule-events');
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch real schedule events:', error);
      }
    }
    return await mockApiService.getAllEvents();
  }

  // Get all public speakers
  async getPublicSpeakers(): Promise<Speaker[]> {
    if (USE_REAL_DB) {
      try {
        const response = await fetch('/api/public/speakers');
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch real speakers:', error);
      }
    }
    return await mockApiService.getAllSpeakers();
  }

  // Get all public exhibitors
  async getPublicExhibitors(): Promise<ExhibitorType[]> {
    if (USE_REAL_DB) {
      try {
        const response = await fetch('/api/public/exhibitors');
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch real exhibitors:', error);
      }
    }
    return await mockApiService.getAllExhibitors();
  }

  // Get all public locations
  async getPublicLocations(): Promise<LocationType[]> {
    if (USE_REAL_DB) {
      try {
        const response = await fetch('/api/public/locations');
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch real locations:', error);
      }
    }
    return await mockApiService.getAllLocations();
  }

  // Get a specific speaker by ID
  async getPublicSpeakerById(id: string): Promise<Speaker | null> {
    if (USE_REAL_DB) {
      try {
        const response = await fetch(`/api/public/speakers/${id}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch real speaker:', error);
      }
    }
    return await mockApiService.getSpeakerById(id);
  }

  // Get a specific schedule event by ID
  async getPublicScheduleEventById(id: string): Promise<ScheduleEvent | null> {
    if (USE_REAL_DB) {
      try {
        const response = await fetch(`/api/public/schedule-events/${id}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch real schedule event:', error);
      }
    }
    return await mockApiService.getEventById(id);
  }

  // Get a specific exhibitor by ID
  async getPublicExhibitorById(id: string): Promise<ExhibitorType | null> {
    if (USE_REAL_DB) {
      try {
        const response = await fetch(`/api/public/exhibitors/${id}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch real exhibitor:', error);
      }
    }
    return await mockApiService.getExhibitorById(id);
  }
}

export const publicApiService = new PublicApiService();
