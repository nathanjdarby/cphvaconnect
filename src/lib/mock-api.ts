// Mock API service that works in the browser
// This provides the same interface as our database service but uses mock data
import {
  User,
  Ticket,
  ScheduleEvent,
  Speaker,
  ExhibitorType,
  TicketType,
  LocationType,
  Poll,
  PollOption,
  UserVote,
  AppSettings,
} from "../types";
import {
  initialMockUsers,
  initialMockTickets,
  initialMockSchedule,
  initialMockSpeakers,
  initialMockTicketTypes,
  initialMockLocations,
  initialMockExhibitors,
  initialMockPolls,
  initialMockUserVotes,
  defaultAppSettings,
} from "./mock-data";

// Helper functions for localStorage persistence
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn(`Failed to parse stored data for ${key}:`, e);
      }
    }
  }
  return defaultValue;
}

// Initialize with default data first
let users = [...initialMockUsers];
let tickets = [...initialMockTickets];
let scheduleEvents = [...initialMockSchedule];
let speakers = [...initialMockSpeakers];
let ticketTypes = [...initialMockTicketTypes];
let locations = [...initialMockLocations];
let exhibitors = [...initialMockExhibitors];
let polls = [...initialMockPolls];
let userVotes = [...initialMockUserVotes];
let appSettings = { ...defaultAppSettings };

// Load from localStorage if available (client-side only)
if (typeof window !== "undefined") {
  users = loadFromStorage("cphva_users", users);
  tickets = loadFromStorage("cphva_tickets", tickets);
  scheduleEvents = loadFromStorage("cphva_schedule", scheduleEvents);
  speakers = loadFromStorage("cphva_speakers", speakers);
  ticketTypes = loadFromStorage("cphva_ticket_types", ticketTypes);
  locations = loadFromStorage("cphva_locations", locations);
  exhibitors = loadFromStorage("cphva_exhibitors", exhibitors);
  polls = loadFromStorage("cphva_polls", polls);
  userVotes = loadFromStorage("cphva_user_votes", userVotes);
  appSettings = loadFromStorage("cphva_app_settings", appSettings);
}

// Persistent session storage
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
const SESSION_KEY = "cphva_sessions";

function loadSessions(): Map<string, { userId: string; expiresAt: number }> {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const sessionData = JSON.parse(stored);
        const sessions = new Map();
        Object.entries(sessionData).forEach(([token, data]: [string, any]) => {
          // Only load non-expired sessions
          if (data.expiresAt > Date.now()) {
            sessions.set(token, data);
          }
        });
        return sessions;
      } catch (e) {
        console.warn("Failed to parse stored sessions:", e);
      }
    }
  }
  return new Map();
}

function saveSessions(
  sessions: Map<string, { userId: string; expiresAt: number }>
): void {
  if (typeof window !== "undefined") {
    const sessionData: Record<string, { userId: string; expiresAt: number }> =
      {};
    sessions.forEach((data, token) => {
      sessionData[token] = data;
    });
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
}

let sessions = loadSessions();

// Helper function to convert boolean to number for SQLite compatibility
function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

// Helper function to convert number to boolean for SQLite compatibility
function intToBool(value: number | null): boolean {
  return value === 1;
}

export const mockApiService = {
  // Auth operations
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string } | null> {
    const user = users.find((u) => u.email === email);
    if (!user || password.length < 1) {
      return null;
    }

    const token = `token-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessions.set(token, {
      userId: user.id,
      expiresAt: Date.now() + SESSION_TIMEOUT,
    });
    saveSessions(sessions);

    return { user, token };
  },

  async register(
    userData: Omit<User, "id">
  ): Promise<{ user: User; token: string } | null> {
    const existingUser = users.find((u) => u.email === userData.email);
    if (existingUser) {
      return null;
    }

    const userId = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newUser: User = {
      id: userId,
      ...userData,
    };

    users.push(newUser);
    saveToStorage("cphva_users", users);

    const token = `token-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessions.set(token, {
      userId: newUser.id,
      expiresAt: Date.now() + SESSION_TIMEOUT,
    });
    saveSessions(sessions);

    return { user: newUser, token };
  },

  async getCurrentUser(token: string): Promise<User | null> {
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      sessions.delete(token);
      return null;
    }

    return users.find((u) => u.id === session.userId) || null;
  },

  async logout(token: string): Promise<void> {
    sessions.delete(token);
  },

  isValidToken(token: string): boolean {
    const session = sessions.get(token);
    return session !== undefined && session.expiresAt > Date.now();
  },

  // User operations
  async getAllUsers(): Promise<User[]> {
    return users;
  },

  async getUserById(id: string): Promise<User | null> {
    return users.find((u) => u.id === id) || null;
  },

  async createUser(user: User): Promise<void> {
    users.push(user);
    saveToStorage("cphva_users", users);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      saveToStorage("cphva_users", users);
    }
  },

  async deleteUser(id: string): Promise<void> {
    users = users.filter((u) => u.id !== id);
    saveToStorage("cphva_users", users);
  },

  // Ticket operations
  async getTicketsByUserId(userId: string): Promise<Ticket[]> {
    return tickets.filter((t) => t.userId === userId);
  },

  async getAllTickets(): Promise<Ticket[]> {
    return tickets;
  },

  async createTicket(ticket: Omit<Ticket, "id">): Promise<string> {
    const id = `ticket-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newTicket: Ticket = { id, ...ticket };
    tickets.push(newTicket);
    saveToStorage("cphva_tickets", tickets);
    return id;
  },

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<void> {
    const ticketIndex = tickets.findIndex((t) => t.id === id);
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = { ...tickets[ticketIndex], ...updates };
      saveToStorage("cphva_tickets", tickets);
    }
  },

  async getTicketByQrCode(qrCode: string): Promise<Ticket | null> {
    return tickets.find((t) => t.qrCodeValue === qrCode) || null;
  },

  // Schedule operations
  async getAllEvents(): Promise<ScheduleEvent[]> {
    return scheduleEvents;
  },

  async getEventById(id: string): Promise<ScheduleEvent | null> {
    return scheduleEvents.find((e) => e.id === id) || null;
  },

  async createEvent(event: Omit<ScheduleEvent, "id">): Promise<string> {
    const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: ScheduleEvent = { id, ...event };
    scheduleEvents.push(newEvent);
    saveToStorage("cphva_schedule", scheduleEvents);
    return id;
  },

  async updateEvent(
    id: string,
    updates: Partial<ScheduleEvent>
  ): Promise<void> {
    const eventIndex = scheduleEvents.findIndex((e) => e.id === id);
    if (eventIndex !== -1) {
      scheduleEvents[eventIndex] = {
        ...scheduleEvents[eventIndex],
        ...updates,
      };
      saveToStorage("cphva_schedule", scheduleEvents);
    }
  },

  async deleteEvent(id: string): Promise<void> {
    scheduleEvents = scheduleEvents.filter((e) => e.id !== id);
    saveToStorage("cphva_schedule", scheduleEvents);
  },

  // Speaker operations
  async getAllSpeakers(): Promise<Speaker[]> {
    return speakers;
  },

  async getSpeakerById(id: string): Promise<Speaker | null> {
    return speakers.find((s) => s.id === id) || null;
  },

  async createSpeaker(speaker: Omit<Speaker, "id">): Promise<string> {
    const id = `speaker-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newSpeaker: Speaker = { id, ...speaker };
    speakers.push(newSpeaker);
    saveToStorage("cphva_speakers", speakers);
    return id;
  },

  async updateSpeaker(id: string, updates: Partial<Speaker>): Promise<void> {
    const speakerIndex = speakers.findIndex((s) => s.id === id);
    if (speakerIndex !== -1) {
      speakers[speakerIndex] = { ...speakers[speakerIndex], ...updates };
      saveToStorage("cphva_speakers", speakers);
    }
  },

  async deleteSpeaker(id: string): Promise<void> {
    speakers = speakers.filter((s) => s.id !== id);
    saveToStorage("cphva_speakers", speakers);
  },

  // Poll operations
  async getAllPolls(): Promise<Poll[]> {
    return polls;
  },

  async getPollById(id: string): Promise<Poll | null> {
    return polls.find((p) => p.id === id) || null;
  },

  async createPoll(poll: Omit<Poll, "id">): Promise<string> {
    const id = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPoll: Poll = { id, ...poll };
    polls.push(newPoll);
    saveToStorage("cphva_polls", polls);
    return id;
  },

  async voteInPoll(
    userId: string,
    pollId: string,
    optionId: string
  ): Promise<void> {
    const poll = polls.find((p) => p.id === pollId);
    if (poll) {
      const option = poll.options.find((o) => o.id === optionId);
      if (option) {
        option.votes += 1;
      }
    }
  },

  // Settings operations
  async getAppSettings(): Promise<AppSettings> {
    return appSettings;
  },

  async updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
    appSettings = { ...appSettings, ...settings };
    saveToStorage("cphva_app_settings", appSettings);
  },

  // Ticket Type operations
  async getAllTicketTypes(): Promise<TicketType[]> {
    return ticketTypes;
  },

  async createTicketType(ticketType: Omit<TicketType, "id">): Promise<string> {
    const id = `tt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTicketType: TicketType = { id, ...ticketType };
    ticketTypes.push(newTicketType);
    saveToStorage("cphva_ticket_types", ticketTypes);
    return id;
  },

  async updateTicketType(
    id: string,
    updates: Partial<TicketType>
  ): Promise<void> {
    const ticketTypeIndex = ticketTypes.findIndex((tt) => tt.id === id);
    if (ticketTypeIndex !== -1) {
      ticketTypes[ticketTypeIndex] = {
        ...ticketTypes[ticketTypeIndex],
        ...updates,
      };
      saveToStorage("cphva_ticket_types", ticketTypes);
    }
  },

  async deleteTicketType(id: string): Promise<void> {
    ticketTypes = ticketTypes.filter((tt) => tt.id !== id);
    saveToStorage("cphva_ticket_types", ticketTypes);
  },

  // Location operations
  async getAllLocations(): Promise<LocationType[]> {
    return locations;
  },

  async createLocation(location: Omit<LocationType, "id">): Promise<string> {
    const id = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLocation: LocationType = { id, ...location };
    locations.push(newLocation);
    saveToStorage("cphva_locations", locations);
    return id;
  },

  async updateLocation(
    id: string,
    updates: Partial<LocationType>
  ): Promise<void> {
    const locationIndex = locations.findIndex((l) => l.id === id);
    if (locationIndex !== -1) {
      locations[locationIndex] = { ...locations[locationIndex], ...updates };
      saveToStorage("cphva_locations", locations);
    }
  },

  async deleteLocation(id: string): Promise<void> {
    locations = locations.filter((l) => l.id !== id);
    saveToStorage("cphva_locations", locations);
  },

  // Exhibitor operations
  async getAllExhibitors(): Promise<ExhibitorType[]> {
    return exhibitors;
  },

  async getExhibitorById(id: string): Promise<ExhibitorType | null> {
    return exhibitors.find((e) => e.id === id) || null;
  },

  async createExhibitor(exhibitor: Omit<ExhibitorType, "id">): Promise<string> {
    const id = `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newExhibitor: ExhibitorType = { id, ...exhibitor };
    exhibitors.push(newExhibitor);
    saveToStorage("cphva_exhibitors", exhibitors);
    return id;
  },

  async updateExhibitor(
    id: string,
    updates: Partial<ExhibitorType>
  ): Promise<void> {
    const exhibitorIndex = exhibitors.findIndex((e) => e.id === id);
    if (exhibitorIndex !== -1) {
      exhibitors[exhibitorIndex] = {
        ...exhibitors[exhibitorIndex],
        ...updates,
      };
      saveToStorage("cphva_exhibitors", exhibitors);
    }
  },

  async deleteExhibitor(id: string): Promise<void> {
    exhibitors = exhibitors.filter((e) => e.id !== id);
    saveToStorage("cphva_exhibitors", exhibitors);
  },

  async closePoll(id: string): Promise<void> {
    const pollIndex = polls.findIndex((p) => p.id === id);
    if (pollIndex !== -1) {
      polls[pollIndex].isOpen = false;
      saveToStorage("cphva_polls", polls);
    }
  },

  async validateTicket(
    qrCode: string
  ): Promise<{ isValid: boolean; ticket?: Ticket }> {
    const ticket = tickets.find((t) => t.qrCodeValue === qrCode);
    if (!ticket) {
      return { isValid: false };
    }
    return { isValid: true, ticket };
  },
};

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  }
}, 60000); // Check every minute
