// Client-safe admin service that makes API calls to backend routes
// This prevents server-side database code from being bundled on the client
import { User } from "../types";

const API_BASE = "/api/admin";

export const adminClientService = {
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) {
      console.error("Failed to fetch users:", response.statusText);
      return [];
    }
    return response.json();
  },

  async createUser(userData: Omit<User, "id">): Promise<User | null> {
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Create user API error:", errorData.error);
      return null;
    }

    return response.json();
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Update user API error:", errorData.error);
      return null;
    }

    return response.json();
  },

  async deleteUser(userId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Delete user API error:", errorData.error);
      return false;
    }

    return true;
  },
};
