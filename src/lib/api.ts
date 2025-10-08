// API client for communicating with our database through API routes
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

const API_BASE = "/api";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    userData: Omit<User, "id">
  ): Promise<{ user: User; token: string }> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(token: string): Promise<User | null> {
    return this.request(`/auth/user?token=${token}`);
  }

  async logout(token: string): Promise<void> {
    return this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // User endpoints
  async getAllUsers(): Promise<User[]> {
    return this.request("/users");
  }

  async getUserById(id: string): Promise<User | null> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // Ticket endpoints
  async getTicketsByUserId(userId: string): Promise<Ticket[]> {
    return this.request(`/tickets?userId=${userId}`);
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.request("/tickets");
  }

  async createTicket(ticket: Omit<Ticket, "id">): Promise<string> {
    return this.request("/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    });
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<void> {
    return this.request(`/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async getTicketByQrCode(qrCode: string): Promise<Ticket | null> {
    return this.request(`/tickets/qr/${qrCode}`);
  }

  // Schedule endpoints
  async getAllEvents(): Promise<ScheduleEvent[]> {
    return this.request("/schedule");
  }

  async getEventById(id: string): Promise<ScheduleEvent | null> {
    return this.request(`/schedule/${id}`);
  }

  async createEvent(event: Omit<ScheduleEvent, "id">): Promise<string> {
    return this.request("/schedule", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  async updateEvent(
    id: string,
    updates: Partial<ScheduleEvent>
  ): Promise<void> {
    return this.request(`/schedule/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request(`/schedule/${id}`, {
      method: "DELETE",
    });
  }

  // Speaker endpoints
  async getAllSpeakers(): Promise<Speaker[]> {
    return this.request("/speakers");
  }

  async getSpeakerById(id: string): Promise<Speaker | null> {
    return this.request(`/speakers/${id}`);
  }

  async createSpeaker(speaker: Omit<Speaker, "id">): Promise<string> {
    return this.request("/speakers", {
      method: "POST",
      body: JSON.stringify(speaker),
    });
  }

  async updateSpeaker(id: string, updates: Partial<Speaker>): Promise<void> {
    return this.request(`/speakers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteSpeaker(id: string): Promise<void> {
    return this.request(`/speakers/${id}`, {
      method: "DELETE",
    });
  }

  // Poll endpoints
  async getAllPolls(): Promise<Poll[]> {
    return this.request("/polls");
  }

  async getPollById(id: string): Promise<Poll | null> {
    return this.request(`/polls/${id}`);
  }

  async createPoll(poll: Omit<Poll, "id">): Promise<string> {
    return this.request("/polls", {
      method: "POST",
      body: JSON.stringify(poll),
    });
  }

  async voteInPoll(
    userId: string,
    pollId: string,
    optionId: string
  ): Promise<void> {
    return this.request("/polls/vote", {
      method: "POST",
      body: JSON.stringify({ userId, pollId, optionId }),
    });
  }

  // Settings endpoints
  async getAppSettings(): Promise<AppSettings> {
    return this.request("/settings");
  }

  async updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
    return this.request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Ticket Type endpoints
  async getAllTicketTypes(): Promise<TicketType[]> {
    return this.request("/ticket-types");
  }

  async createTicketType(ticketType: Omit<TicketType, "id">): Promise<string> {
    return this.request("/ticket-types", {
      method: "POST",
      body: JSON.stringify(ticketType),
    });
  }

  async updateTicketType(
    id: string,
    updates: Partial<TicketType>
  ): Promise<void> {
    return this.request(`/ticket-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteTicketType(id: string): Promise<void> {
    return this.request(`/ticket-types/${id}`, {
      method: "DELETE",
    });
  }

  // Location endpoints
  async getAllLocations(): Promise<LocationType[]> {
    return this.request("/locations");
  }

  async createLocation(location: Omit<LocationType, "id">): Promise<string> {
    return this.request("/locations", {
      method: "POST",
      body: JSON.stringify(location),
    });
  }

  async updateLocation(
    id: string,
    updates: Partial<LocationType>
  ): Promise<void> {
    return this.request(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteLocation(id: string): Promise<void> {
    return this.request(`/locations/${id}`, {
      method: "DELETE",
    });
  }

  // Exhibitor endpoints
  async getAllExhibitors(): Promise<ExhibitorType[]> {
    return this.request("/exhibitors");
  }

  async getExhibitorById(id: string): Promise<ExhibitorType | null> {
    return this.request(`/exhibitors/${id}`);
  }

  async createExhibitor(exhibitor: Omit<ExhibitorType, "id">): Promise<string> {
    return this.request("/exhibitors", {
      method: "POST",
      body: JSON.stringify(exhibitor),
    });
  }

  async updateExhibitor(
    id: string,
    updates: Partial<ExhibitorType>
  ): Promise<void> {
    return this.request(`/exhibitors/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteExhibitor(id: string): Promise<void> {
    return this.request(`/exhibitors/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
