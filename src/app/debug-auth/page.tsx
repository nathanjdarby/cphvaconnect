"use client";

import { useAuth } from "../../hooks/use-auth";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function DebugAuthPage() {
  const { user, loading } = useAuth();
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      setToken(storedToken);
    }
  }, []);

  const checkAuthStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/debug/auth-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      setAuthStatus({ error: "Failed to check auth status" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth Context Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Loading:</strong> {loading ? "Yes" : "No"}
              </p>
              <p>
                <strong>User:</strong>{" "}
                {user ? JSON.stringify(user, null, 2) : "None"}
              </p>
              <p>
                <strong>Token in localStorage:</strong> {token ? "Yes" : "No"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Auth Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkAuthStatus} className="mb-4">
              Check Auth Status
            </Button>
            {authStatus && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(authStatus, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>NEXT_PUBLIC_USE_REAL_DATABASE:</strong>{" "}
                {process.env.NEXT_PUBLIC_USE_REAL_DATABASE}
              </p>
              <p>
                <strong>USE_REAL_DATABASE:</strong>{" "}
                {process.env.USE_REAL_DATABASE}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
