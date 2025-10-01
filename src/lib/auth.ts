import { userService } from "./database";
import { User } from "@/types";

// Simple in-memory session storage (in production, use proper session management)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

// Session timeout (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export const authService = {
  // Simple login with email/password (in production, use proper password hashing)
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string } | null> {
    try {
      // For demo purposes, we'll use a simple password check
      // In production, you should use proper password hashing
      const users = await userService.getAllUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        return null;
      }

      // Simple password check (in production, use bcrypt or similar)
      // For demo, we'll accept any password for existing users
      if (password.length < 1) {
        return null;
      }

      // Generate a simple token
      const token = `token-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Store session
      sessions.set(token, {
        userId: user.id,
        expiresAt: Date.now() + SESSION_TIMEOUT,
      });

      return { user, token };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  // Register a new user
  async register(
    userData: Omit<User, "id">
  ): Promise<{ user: User; token: string } | null> {
    try {
      // Check if user already exists
      const users = await userService.getAllUsers();
      const existingUser = users.find((u) => u.email === userData.email);

      if (existingUser) {
        return null; // User already exists
      }

      // Create new user
      const userId = `user-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newUser: User = {
        id: userId,
        ...userData,
      };

      await userService.createUser(newUser);

      // Generate token
      const token = `token-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Store session
      sessions.set(token, {
        userId: newUser.id,
        expiresAt: Date.now() + SESSION_TIMEOUT,
      });

      return { user: newUser, token };
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  },

  // Get current user from token
  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const session = sessions.get(token);

      if (!session || session.expiresAt < Date.now()) {
        // Session expired or doesn't exist
        sessions.delete(token);
        return null;
      }

      const user = await userService.getUserById(session.userId);
      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Logout
  async logout(token: string): Promise<void> {
    sessions.delete(token);
  },

  // Validate token
  isValidToken(token: string): boolean {
    const session = sessions.get(token);
    return session !== undefined && session.expiresAt > Date.now();
  },

  // Get user by ID (for admin operations)
  async getUserById(id: string): Promise<User | null> {
    return userService.getUserById(id);
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await userService.updateUser(id, updates);
  },

  // Get all users (for admin operations)
  async getAllUsers(): Promise<User[]> {
    return userService.getAllUsers();
  },

  // Delete user (for admin operations)
  async deleteUser(id: string): Promise<void> {
    await userService.deleteUser(id);
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
