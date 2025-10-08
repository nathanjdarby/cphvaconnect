
"use client";

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../hooks/use-auth";
import { LogIn } from "lucide-react";
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  useEffect(() => {
    // This effect runs only on the client, after the component mounts
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = await login(values.email, values.password);
    if (success) {
      router.push('/'); // Redirect to the homepage on successful login.
    }
    // Error toasts are handled within the login function in the auth context.
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isClient ? (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} type="email" autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" autoComplete="current-password"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          // Render placeholders on SSR to maintain layout and minimize CLS
          <>
            <div className="space-y-2">
              <div className="h-[20px] w-1/4 bg-muted rounded animate-pulse mb-1" /> {/* Approx Label height */}
              <div className="h-10 w-full bg-muted rounded animate-pulse" /> {/* Input height */}
            </div>
            <div className="space-y-2">
              <div className="h-[20px] w-1/4 bg-muted rounded animate-pulse mb-1" /> {/* Approx Label height */}
              <div className="h-10 w-full bg-muted rounded animate-pulse" /> {/* Input height */}
            </div>
          </>
        )}
        <Button type="submit" className="w-full" disabled={isLoading || !isClient}>
          {isLoading ? "Logging in..." : <> <LogIn className="mr-2 h-4 w-4" /> Login </>}
        </Button>
      </form>
    </Form>
  );
}
