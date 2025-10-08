// Client-side authentication service that doesn't import database directly
// This prevents better-sqlite3 from being bundled in the client

import { User } from "../types";

// Simple in-memory session storage (in production, use proper session management)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

// Session timeout (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export const authClientService = {
  // Validate token
  isValidToken(token: string): boolean {
    const session = sessions.get(token);
    return session !== undefined && session.expiresAt > Date.now();
  },

  // Get current user from token (client-side only)
  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const session = sessions.get(token);

      if (!session || session.expiresAt < Date.now()) {
        // Session expired or doesn't exist
        sessions.delete(token);
        return null;
      }

      // For client-side, we need to make an API call to get user data
      // since we can't access the database directly
      const response = await fetch('/api/auth/current-user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Logout
  async logout(token: string): Promise<void> {
    try {
      // Call server to invalidate session
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always remove from client-side storage
      sessions.delete(token);
    }
  },

  // Login (client-side only - makes API call)
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string } | null> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      
      if (result.user && result.token) {
        // Store session on client side
        sessions.set(result.token, {
          userId: result.user.id,
          expiresAt: Date.now() + SESSION_TIMEOUT,
        });
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
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