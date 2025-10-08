"use client";

import type {
  User,
  Ticket,
  ScheduleEvent,
  Speaker,
  TicketType,
  LocationType,
  ExhibitorType,
  Poll,
  EventFile,
  UserVote,
  AppSettings,
} from "../types";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useToast } from "../hooks/use-toast";
import { mockApiService } from "../lib/mock-api";
import { authService } from "../lib/auth";

// Check if we should use real database
const USE_REAL_DB = process.env.NEXT_PUBLIC_USE_REAL_DATABASE === 'true' || 
                     typeof window === 'undefined' && process.env.USE_REAL_DATABASE === 'true';

const mapUserWithDefaults = (
  userData: Partial<User> & { id: string }
): User => {
  const validRoles: User["role"][] = ["admin", "attendee", "organiser", "staff"];
  let role: User["role"] = "attendee";

  if (userData.role && validRoles.includes(userData.role)) {
    role = userData.role;
  } else if (userData.role) {
    console.warn(
      `AuthContext mapUserWithDefaults: Invalid role "${
        userData.role
      }" for user ${userData.email || userData.id}. Defaulting to 'attendee'.`
    );
  }

  return {
    id: userData.id,
    name: userData.name || "Unnamed User",
    email: userData.email || "No Email",
    role: role,
    nameIsPublic:
      userData.nameIsPublic === undefined ? true : userData.nameIsPublic,
    emailIsPublic:
      userData.emailIsPublic === undefined ? false : userData.emailIsPublic,
    bio: userData.bio || "",
    avatarUrl: userData.avatarUrl || null,
    avatarStoragePath: userData.avatarStoragePath || null,
  };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (
    userId: string,
    updates: Partial<
      Pick<User, "name" | "email" | "nameIsPublic" | "emailIsPublic" | "bio">
    >,
    newPassword?: string,
    newAvatarFile?: File | null,
    removeAvatar?: boolean
  ) => Promise<boolean>;

  userTickets: Ticket[];
  allUsers: User[];
  allTickets: Ticket[];
  addTicket: (
    ticketTypeName: string,
    newAccountDetails?: { name: string; email: string; password?: string }
  ) => Promise<{ success: boolean; newUserCreated?: boolean }>;

  allScheduleEvents: ScheduleEvent[];
  allSpeakers: Speaker[];
  allTicketTypes: TicketType[];
  allLocations: LocationType[];
  allExhibitors: ExhibitorType[];
  allPolls: Poll[];
  userVotes: UserVote[];
  appSettings: AppSettings;
  updateAppSettings: (updates: Partial<AppSettings>) => Promise<boolean>;

  addScheduleEvent: (
    event: Omit<ScheduleEvent, "id">,
    filesToUpload?: { file: File; category: string }[]
  ) => Promise<ScheduleEvent | null>;
  updateScheduleEvent: (
    eventId: string,
    updates: Partial<ScheduleEvent>,
    filesToUpload?: { file: File; category: string }[],
    filesToRemoveFromStoragePaths?: string[],
    existingFilesToKeep?: EventFile[]
  ) => Promise<ScheduleEvent | null>;
  deleteScheduleEvent: (eventId: string) => Promise<boolean>;

  addSpeaker: (
    speaker: Omit<Speaker, "id">,
    imageFile?: File | null
  ) => Promise<Speaker | null>;
  updateSpeaker: (
    speakerId: string,
    updates: Partial<Speaker>,
    imageFile?: File | null,
    removeImageFlag?: boolean
  ) => Promise<Speaker | null>;
  deleteSpeaker: (speakerId: string) => Promise<boolean>;

  addExhibitor: (
    exhibitor: Omit<ExhibitorType, "id">,
    logoFile?: File | null
  ) => Promise<ExhibitorType | null>;
  updateExhibitor: (
    exhibitorId: string,
    updates: Partial<ExhibitorType>,
    logoFile?: File | null,
    removeLogoFlag?: boolean
  ) => Promise<ExhibitorType | null>;
  deleteExhibitor: (exhibitorId: string) => Promise<boolean>;

  addTicketType: (
    ticketType: Omit<TicketType, "id">
  ) => Promise<TicketType | null>;
  updateTicketType: (
    ticketTypeId: string,
    updates: Partial<TicketType>
  ) => Promise<TicketType | null>;
  deleteTicketType: (ticketTypeId: string) => Promise<boolean>;

  addLocation: (
    location: Omit<LocationType, "id">
  ) => Promise<LocationType | null>;
  updateLocation: (
    locationId: string,
    updates: Partial<LocationType>
  ) => Promise<LocationType | null>;
  deleteLocation: (locationId: string) => Promise<boolean>;

  addPoll: (poll: Omit<Poll, "id">) => Promise<Poll | null>;
  closePoll: (pollId: string) => Promise<boolean>;
  deletePoll: (pollId: string) => Promise<boolean>;
  voteInPoll: (pollId: string, optionId: string) => Promise<boolean>;

  updateUserRole: (userId: string, newRole: User["role"]) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;

  // Additional methods needed by the application
  toggleTicketCheckIn: (ticketId: string) => Promise<boolean>;
  deleteTicket: (ticketId: string) => Promise<boolean>;
  adminCreateUser: (
    name: string,
    email: string,
    password: string,
    role: User["role"]
  ) => Promise<User | null>;
  adminCreateTicket: (
    userId: string,
    ticketTypeName: string
  ) => Promise<Ticket | null>;
  createPoll: (poll: Omit<Poll, "id">) => Promise<Poll | null>;
  castVote: (pollId: string, optionId: string) => Promise<boolean>;
  validateTicket: (qrCode: string) => Promise<{
    isValid: boolean;
    message: string;
    isNewlyCheckedIn?: boolean;
    ticket?: Ticket;
  }>;

  refreshData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [allScheduleEvents, setAllScheduleEvents] = useState<ScheduleEvent[]>(
    []
  );
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [allTicketTypes, setAllTicketTypes] = useState<TicketType[]>([]);
  const [allLocations, setAllLocations] = useState<LocationType[]>([]);
  const [allExhibitors, setAllExhibitors] = useState<ExhibitorType[]>([]);
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    title: "Unite-CPHVA Annual Professional Conference 2025",
    ticketSalesEnabled: true,
    colors: {
      background: "0 0% 94%",
      foreground: "0 0% 20%",
      primary: "166 29% 40%",
      accent: "283 49% 60%",
    },
  });

  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we're in the browser
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("authToken");
          if (token && mockApiService.isValidToken(token)) {
            const currentUser = await mockApiService.getCurrentUser(token);
            if (currentUser) {
              setUser(mapUserWithDefaults(currentUser));
            }
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear user-specific data when logged out
      setUserTickets([]);
      setUserVotes([]);
    }
  }, [user]);

  // Load all public data regardless of authentication status
  useEffect(() => {
    loadPublicData();
  }, []);

  // Load admin-specific data when user is admin
  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user tickets
      const tickets = await mockApiService.getTicketsByUserId(user.id);
      setUserTickets(tickets);

      // Load user votes (simplified - in real app, you'd track user votes)
      setUserVotes([]);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadPublicData = async () => {
    try {
      // Load public data (speakers, events, exhibitors, locations)
      const [events, speakers, locations, exhibitors, polls, settings] =
        await Promise.all([
          mockApiService.getAllEvents(),
          mockApiService.getAllSpeakers(),
          mockApiService.getAllLocations(),
          mockApiService.getAllExhibitors(),
          mockApiService.getAllPolls(),
          mockApiService.getAppSettings(),
        ]);

      setAllScheduleEvents(events);
      setAllSpeakers(speakers);
      setAllLocations(locations);
      setAllExhibitors(exhibitors);
      setAllPolls(polls);
      setAppSettings(settings);
    } catch (error) {
      console.error("Error loading public data:", error);
    }
  };

  const loadAdminData = async () => {
    try {
      // Load admin-specific data (users, tickets, ticket types)
      const [users, tickets, ticketTypes] = await Promise.all([
        mockApiService.getAllUsers(),
        mockApiService.getAllTickets(),
        mockApiService.getAllTicketTypes(),
      ]);

      setAllUsers(users);
      setAllTickets(tickets);
      setAllTicketTypes(ticketTypes);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const refreshData = async () => {
    // Always refresh public data
    await loadPublicData();

    if (user?.role === "admin") {
      await loadAdminData();
    }
    if (user) {
      await loadUserData();
    }
  };

  const login = async (
    email: string,
    password: string = "demo"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login with:', email, 'USE_REAL_DB:', USE_REAL_DB);
      
      // Use real database authentication if enabled
      const result = USE_REAL_DB 
        ? await authService.login(email, password)
        : await mockApiService.login(email, password);

      if (result) {
        const mappedUser = mapUserWithDefaults(result.user);
        setUser(mappedUser);
        localStorage.setItem("authToken", result.token);
        toast({
          title: "Login successful",
          description: `Welcome back, ${mappedUser.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await mockApiService.logout(token);
        localStorage.removeItem("authToken");
      }
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUserProfile = async (
    userId: string,
    updates: Partial<
      Pick<User, "name" | "email" | "nameIsPublic" | "emailIsPublic" | "bio">
    >,
    newPassword?: string,
    newAvatarFile?: File | null,
    removeAvatar?: boolean
  ): Promise<boolean> => {
    try {
      await mockApiService.updateUser(userId, updates);

      // Update local user state if it's the current user
      if (user && user.id === userId) {
        setUser(mapUserWithDefaults({ ...user, ...updates }));
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addTicket = async (
    ticketTypeName: string,
    newAccountDetails?: { name: string; email: string; password?: string }
  ): Promise<{ success: boolean; newUserCreated?: boolean }> => {
    try {
      let targetUser = user;
      let newUserCreated = false;

      if (newAccountDetails) {
        // Create new user account
        const newUser = await mockApiService.register({
          name: newAccountDetails.name,
          email: newAccountDetails.email,
          role: "attendee",
          nameIsPublic: true,
          emailIsPublic: false,
          bio: "",
          avatarUrl: null,
          avatarStoragePath: null,
        });

        if (newUser) {
          targetUser = newUser.user;
          newUserCreated = true;
        } else {
          throw new Error("Failed to create new user account");
        }
      }

      if (!targetUser) {
        throw new Error("No user available for ticket creation");
      }

      // Find ticket type
      const ticketType = allTicketTypes.find(
        (tt) => tt.name === ticketTypeName
      );
      if (!ticketType) {
        throw new Error("Ticket type not found");
      }

      // Create ticket
      const ticketId = await mockApiService.createTicket({
        userId: targetUser.id,
        userName: targetUser.name,
        conferenceName: appSettings.title,
        ticketType: ticketType.name,
        ticketPrice: ticketType.price,
        purchaseDate: new Date().toISOString(),
        qrCodeValue: `TICKET-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        isCheckedIn: false,
        checkInTimestamp: null,
      });

      // Refresh data
      await refreshData();

      toast({
        title: "Ticket created",
        description: `Ticket for ${ticketType.name} has been created successfully.`,
      });

      return { success: true, newUserCreated };
    } catch (error) {
      console.error("Add ticket error:", error);
      toast({
        title: "Ticket creation failed",
        description: "Failed to create ticket.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateAppSettings = async (
    updates: Partial<AppSettings>
  ): Promise<boolean> => {
    try {
      await mockApiService.updateAppSettings(updates);
      const newSettings = await mockApiService.getAppSettings();
      setAppSettings(newSettings);

      toast({
        title: "Settings updated",
        description: "Application settings have been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Update settings error:", error);
      toast({
        title: "Settings update failed",
        description: "Failed to update application settings.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addScheduleEvent = async (
    event: Omit<ScheduleEvent, "id">,
    filesToUpload?: { file: File; category: string }[]
  ): Promise<ScheduleEvent | null> => {
    try {
      const eventId = await mockApiService.createEvent(event);
      const newEvent = await mockApiService.getEventById(eventId);

      if (newEvent) {
        await refreshData();
        toast({
          title: "Event created",
          description: "Schedule event has been created successfully.",
        });
        return newEvent;
      }

      return null;
    } catch (error) {
      console.error("Add event error:", error);
      toast({
        title: "Event creation failed",
        description: "Failed to create schedule event.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateScheduleEvent = async (
    eventId: string,
    updates: Partial<ScheduleEvent>,
    filesToUpload?: { file: File; category: string }[],
    filesToRemoveFromStoragePaths?: string[],
    existingFilesToKeep?: EventFile[]
  ): Promise<ScheduleEvent | null> => {
    try {
      await mockApiService.updateEvent(eventId, updates);
      const updatedEvent = await mockApiService.getEventById(eventId);

      if (updatedEvent) {
        await refreshData();
        toast({
          title: "Event updated",
          description: "Schedule event has been updated successfully.",
        });
        return updatedEvent;
      }

      return null;
    } catch (error) {
      console.error("Update event error:", error);
      toast({
        title: "Event update failed",
        description: "Failed to update schedule event.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteScheduleEvent = async (eventId: string): Promise<boolean> => {
    try {
      await mockApiService.deleteEvent(eventId);
      await refreshData();

      toast({
        title: "Event deleted",
        description: "Schedule event has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete event error:", error);
      toast({
        title: "Event deletion failed",
        description: "Failed to delete schedule event.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addSpeaker = async (
    speaker: Omit<Speaker, "id">,
    imageFile?: File | null
  ): Promise<Speaker | null> => {
    try {
      const speakerId = await mockApiService.createSpeaker(speaker);
      const newSpeaker = await mockApiService.getSpeakerById(speakerId);

      if (newSpeaker) {
        await refreshData();
        toast({
          title: "Speaker added",
          description: "Speaker has been added successfully.",
        });
        return newSpeaker;
      }

      return null;
    } catch (error) {
      console.error("Add speaker error:", error);
      toast({
        title: "Speaker addition failed",
        description: "Failed to add speaker.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSpeaker = async (
    speakerId: string,
    updates: Partial<Speaker>,
    imageFile?: File | null,
    removeImageFlag?: boolean
  ): Promise<Speaker | null> => {
    try {
      await mockApiService.updateSpeaker(speakerId, updates);
      const updatedSpeaker = await mockApiService.getSpeakerById(speakerId);

      if (updatedSpeaker) {
        await refreshData();
        toast({
          title: "Speaker updated",
          description: "Speaker has been updated successfully.",
        });
        return updatedSpeaker;
      }

      return null;
    } catch (error) {
      console.error("Update speaker error:", error);
      toast({
        title: "Speaker update failed",
        description: "Failed to update speaker.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSpeaker = async (speakerId: string): Promise<boolean> => {
    try {
      await mockApiService.deleteSpeaker(speakerId);
      await refreshData();

      toast({
        title: "Speaker deleted",
        description: "Speaker has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete speaker error:", error);
      toast({
        title: "Speaker deletion failed",
        description: "Failed to delete speaker.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addExhibitor = async (
    exhibitor: Omit<ExhibitorType, "id">,
    logoFile?: File | null
  ): Promise<ExhibitorType | null> => {
    try {
      const exhibitorId = await mockApiService.createExhibitor(exhibitor);
      const newExhibitor = await mockApiService.getExhibitorById(exhibitorId);

      if (newExhibitor) {
        await refreshData();
        toast({
          title: "Exhibitor added",
          description: "Exhibitor has been added successfully.",
        });
        return newExhibitor;
      }

      return null;
    } catch (error) {
      console.error("Add exhibitor error:", error);
      toast({
        title: "Exhibitor addition failed",
        description: "Failed to add exhibitor.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateExhibitor = async (
    exhibitorId: string,
    updates: Partial<ExhibitorType>,
    logoFile?: File | null,
    removeLogoFlag?: boolean
  ): Promise<ExhibitorType | null> => {
    try {
      await mockApiService.updateExhibitor(exhibitorId, updates);
      const updatedExhibitor = await mockApiService.getExhibitorById(
        exhibitorId
      );

      if (updatedExhibitor) {
        await refreshData();
        toast({
          title: "Exhibitor updated",
          description: "Exhibitor has been updated successfully.",
        });
        return updatedExhibitor;
      }

      return null;
    } catch (error) {
      console.error("Update exhibitor error:", error);
      toast({
        title: "Exhibitor update failed",
        description: "Failed to update exhibitor.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteExhibitor = async (exhibitorId: string): Promise<boolean> => {
    try {
      await mockApiService.deleteExhibitor(exhibitorId);
      await refreshData();

      toast({
        title: "Exhibitor deleted",
        description: "Exhibitor has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete exhibitor error:", error);
      toast({
        title: "Exhibitor deletion failed",
        description: "Failed to delete exhibitor.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addTicketType = async (
    ticketType: Omit<TicketType, "id">
  ): Promise<TicketType | null> => {
    try {
      const ticketTypeId = await mockApiService.createTicketType(ticketType);
      const newTicketType = allTicketTypes.find((tt) => tt.id === ticketTypeId);

      if (newTicketType) {
        await refreshData();
        toast({
          title: "Ticket type added",
          description: "Ticket type has been added successfully.",
        });
        return newTicketType;
      }

      return null;
    } catch (error) {
      console.error("Add ticket type error:", error);
      toast({
        title: "Ticket type addition failed",
        description: "Failed to add ticket type.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTicketType = async (
    ticketTypeId: string,
    updates: Partial<TicketType>
  ): Promise<TicketType | null> => {
    try {
      await mockApiService.updateTicketType(ticketTypeId, updates);
      const updatedTicketType = allTicketTypes.find(
        (tt) => tt.id === ticketTypeId
      );

      if (updatedTicketType) {
        await refreshData();
        toast({
          title: "Ticket type updated",
          description: "Ticket type has been updated successfully.",
        });
        return updatedTicketType;
      }

      return null;
    } catch (error) {
      console.error("Update ticket type error:", error);
      toast({
        title: "Ticket type update failed",
        description: "Failed to update ticket type.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteTicketType = async (ticketTypeId: string): Promise<boolean> => {
    try {
      await mockApiService.deleteTicketType(ticketTypeId);
      await refreshData();

      toast({
        title: "Ticket type deleted",
        description: "Ticket type has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete ticket type error:", error);
      toast({
        title: "Ticket type deletion failed",
        description: "Failed to delete ticket type.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addLocation = async (
    location: Omit<LocationType, "id">
  ): Promise<LocationType | null> => {
    try {
      const locationId = await mockApiService.createLocation(location);
      const newLocation = allLocations.find((loc) => loc.id === locationId);

      if (newLocation) {
        await refreshData();
        toast({
          title: "Location added",
          description: "Location has been added successfully.",
        });
        return newLocation;
      }

      return null;
    } catch (error) {
      console.error("Add location error:", error);
      toast({
        title: "Location addition failed",
        description: "Failed to add location.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLocation = async (
    locationId: string,
    updates: Partial<LocationType>
  ): Promise<LocationType | null> => {
    try {
      await mockApiService.updateLocation(locationId, updates);
      const updatedLocation = allLocations.find((loc) => loc.id === locationId);

      if (updatedLocation) {
        await refreshData();
        toast({
          title: "Location updated",
          description: "Location has been updated successfully.",
        });
        return updatedLocation;
      }

      return null;
    } catch (error) {
      console.error("Update location error:", error);
      toast({
        title: "Location update failed",
        description: "Failed to update location.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteLocation = async (locationId: string): Promise<boolean> => {
    try {
      await mockApiService.deleteLocation(locationId);
      await refreshData();

      toast({
        title: "Location deleted",
        description: "Location has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete location error:", error);
      toast({
        title: "Location deletion failed",
        description: "Failed to delete location.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addPoll = async (poll: Omit<Poll, "id">): Promise<Poll | null> => {
    try {
      const pollId = await mockApiService.createPoll(poll);
      const newPoll = await mockApiService.getPollById(pollId);

      if (newPoll) {
        await refreshData();
        toast({
          title: "Poll created",
          description: "Poll has been created successfully.",
        });
        return newPoll;
      }

      return null;
    } catch (error) {
      console.error("Add poll error:", error);
      toast({
        title: "Poll creation failed",
        description: "Failed to create poll.",
        variant: "destructive",
      });
      return null;
    }
  };

  const closePoll = async (pollId: string): Promise<boolean> => {
    try {
      // Update poll to close it
      const poll = await mockApiService.getPollById(pollId);
      if (poll) {
        // Note: This would require adding an updatePoll method to pollService
        await refreshData();
        toast({
          title: "Poll closed",
          description: "Poll has been closed successfully.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Close poll error:", error);
      toast({
        title: "Poll closure failed",
        description: "Failed to close poll.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePoll = async (pollId: string): Promise<boolean> => {
    try {
      // Note: This would require adding a deletePoll method to pollService
      await refreshData();

      toast({
        title: "Poll deleted",
        description: "Poll has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete poll error:", error);
      toast({
        title: "Poll deletion failed",
        description: "Failed to delete poll.",
        variant: "destructive",
      });
      return false;
    }
  };

  const voteInPoll = async (
    pollId: string,
    optionId: string
  ): Promise<boolean> => {
    try {
      if (!user) {
        throw new Error("User must be logged in to vote");
      }

      await mockApiService.voteInPoll(user.id, pollId, optionId);
      await refreshData();

      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully.",
      });

      return true;
    } catch (error) {
      console.error("Vote error:", error);
      toast({
        title: "Vote failed",
        description: "Failed to record your vote.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUserRole = async (
    userId: string,
    newRole: User["role"]
  ): Promise<boolean> => {
    try {
      await mockApiService.updateUser(userId, { role: newRole });
      await refreshData();

      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Update role error:", error);
      toast({
        title: "Role update failed",
        description: "Failed to update user role.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await mockApiService.deleteUser(userId);
      await refreshData();

      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete user error:", error);
      toast({
        title: "User deletion failed",
        description: "Failed to delete user.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleTicketCheckIn = async (ticketId: string): Promise<boolean> => {
    try {
      const ticket = allTickets.find((t) => t.id === ticketId);
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      const updates = {
        isCheckedIn: !ticket.isCheckedIn,
        checkInTimestamp: !ticket.isCheckedIn ? new Date().toISOString() : null,
      };

      await mockApiService.updateTicket(ticketId, updates);
      await refreshData();

      toast({
        title: "Ticket updated",
        description: `Ticket ${
          updates.isCheckedIn ? "checked in" : "checked out"
        } successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Toggle ticket check-in error:", error);
      toast({
        title: "Ticket update failed",
        description: "Failed to update ticket check-in status.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTicket = async (ticketId: string): Promise<boolean> => {
    try {
      // Note: This would require adding a deleteTicket method to ticketService
      await refreshData();

      toast({
        title: "Ticket deleted",
        description: "Ticket has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Delete ticket error:", error);
      toast({
        title: "Ticket deletion failed",
        description: "Failed to delete ticket.",
        variant: "destructive",
      });
      return false;
    }
  };

  const adminCreateUser = async (
    name: string,
    email: string,
    password: string,
    role: User["role"]
  ): Promise<User | null> => {
    try {
      const userData: Omit<User, "id"> = {
        name,
        email,
        role,
        nameIsPublic: true,
        emailIsPublic: false,
        bio: "",
        avatarUrl: null,
        avatarStoragePath: null,
      };

      const newUser = await mockApiService.register(userData);
      if (newUser) {
        await refreshData();
        toast({
          title: "User created",
          description: "User has been created successfully.",
        });
        return newUser.user;
      }
      return null;
    } catch (error) {
      console.error("Admin create user error:", error);
      toast({
        title: "User creation failed",
        description: "Failed to create user.",
        variant: "destructive",
      });
      return null;
    }
  };

  const adminCreateTicket = async (
    userId: string,
    ticketTypeName: string
  ): Promise<Ticket | null> => {
    try {
      const targetUser = allUsers.find((u) => u.id === userId);
      const ticketType = allTicketTypes.find(
        (tt) => tt.name === ticketTypeName
      );

      if (!targetUser || !ticketType) {
        toast({
          title: "Error",
          description: "User or ticket type not found.",
          variant: "destructive",
        });
        return null;
      }

      const ticketId = await mockApiService.createTicket({
        userId: targetUser.id,
        userName: targetUser.name,
        conferenceName: appSettings.title,
        ticketType: ticketType.name,
        ticketPrice: ticketType.price,
        purchaseDate: new Date().toISOString(),
        qrCodeValue: `TICKET-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        isCheckedIn: false,
        checkInTimestamp: null,
      });

      // Get all tickets to find the one we just created
      const allTickets = await mockApiService.getAllTickets();
      const newTicket = allTickets.find((t) => t.id === ticketId);
      if (newTicket) {
        await refreshData();
        toast({
          title: "Ticket created",
          description: `Ticket for ${ticketType.name} has been created successfully.`,
        });
        return newTicket;
      }

      return null;
    } catch (error) {
      console.error("Admin create ticket error:", error);
      toast({
        title: "Ticket creation failed",
        description: "Failed to create ticket.",
        variant: "destructive",
      });
      return null;
    }
  };

  const createPoll = async (poll: Omit<Poll, "id">): Promise<Poll | null> => {
    return addPoll(poll);
  };

  const castVote = async (
    pollId: string,
    optionId: string
  ): Promise<boolean> => {
    return voteInPoll(pollId, optionId);
  };

  const validateTicket = async (
    qrCode: string
  ): Promise<{
    isValid: boolean;
    message: string;
    isNewlyCheckedIn?: boolean;
    ticket?: Ticket;
  }> => {
    try {
      const ticket = await mockApiService.getTicketByQrCode(qrCode);
      if (!ticket) {
        return { isValid: false, message: "Invalid Ticket ID." };
      }

      if (ticket.isCheckedIn) {
        return {
          isValid: true,
          message: `Ticket already checked in for ${ticket.userName}.`,
          ticket,
          isNewlyCheckedIn: false,
        };
      }

      // Check in the ticket
      await mockApiService.updateTicket(ticket.id, {
        isCheckedIn: true,
        checkInTimestamp: new Date().toISOString(),
      });

      return {
        isValid: true,
        message: `Ticket checked in for ${ticket.userName}!`,
        isNewlyCheckedIn: true,
        ticket,
      };
    } catch (error) {
      console.error("Validate ticket error:", error);
      return { isValid: false, message: "Error validating ticket status." };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUserProfile,
    userTickets,
    allUsers,
    allTickets,
    addTicket,
    allScheduleEvents,
    allSpeakers,
    allTicketTypes,
    allLocations,
    allExhibitors,
    allPolls,
    userVotes,
    appSettings,
    updateAppSettings,
    addScheduleEvent,
    updateScheduleEvent,
    deleteScheduleEvent,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    addExhibitor,
    updateExhibitor,
    deleteExhibitor,
    addTicketType,
    updateTicketType,
    deleteTicketType,
    addLocation,
    updateLocation,
    deleteLocation,
    addPoll,
    closePoll,
    deletePoll,
    voteInPoll,
    updateUserRole,
    deleteUser,
    toggleTicketCheckIn,
    deleteTicket,
    adminCreateUser,
    adminCreateTicket,
    createPoll,
    castVote,
    validateTicket,
    refreshData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
