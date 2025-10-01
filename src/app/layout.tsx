"use client";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const geistSans = GeistSans;
const geistMono = GeistMono;

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until loading is finished

    const isAuthPage = pathname === "/login" || pathname === "/signup";

    // If a user is logged in, they shouldn't be on the login or signup pages.
    if (user && isAuthPage) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  // Show a loading screen only while fetching the user's auth state for the first time.
  // Or if we are about to redirect a logged-in user from an auth page.
  const isRedirecting =
    user && (pathname === "/login" || pathname === "/signup");
  // Show a loading screen only while fetching the user's auth state for the first time.
  // Or if we are about to redirect a logged-in user from an auth page.
  if (loading || isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main
        className={`flex-grow py-8 ${
          !pathname.startsWith("/admin") &&
          !(pathname === "/login" || pathname === "/signup")
            ? "container mx-auto px-4"
            : "w-full px-4"
        }`}
      >
        {children}
      </main>
      <Footer />
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CPHVA Connect</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
