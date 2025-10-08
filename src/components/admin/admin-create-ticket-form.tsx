"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import type { User, TicketType, Ticket } from "../../types";
import { useToast } from "../../hooks/use-toast";
import {
  User as UserIcon,
  Lock,
  Mail,
  Ticket as TicketIconLucide,
  Building,
} from "lucide-react";

// Define member schemas as functions returning Zod objects
const getExistingUserTicketSchema = () =>
  z.object({
    creationMode: z.literal("existing"),
    userId: z.string().min(1, { message: "Please select an existing user." }),
    ticketTypeName: z
      .string()
      .min(1, { message: "Please select a ticket type." }),
  });

const getNewUserTicketSchema = () =>
  z.object({
    creationMode: z.literal("new"),
    newName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." }),
    newEmail: z.string().email({ message: "Invalid email address." }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    newConfirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    newRole: z.enum(["attendee", "admin"], {
      required_error: "Please select a role for the new user.",
    }),
    ticketTypeName: z
      .string()
      .min(1, { message: "Please select a ticket type." }),
  });

const createTicketFormSchema = z
  .discriminatedUnion("creationMode", [
    getExistingUserTicketSchema(),
    getNewUserTicketSchema(),
  ])
  .superRefine((data, ctx) => {
    if (data.creationMode === "new") {
      if (data.newPassword !== data.newConfirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match",
          path: ["newConfirmPassword"],
        });
      }
    }
  });

type CreateTicketFormValues = z.infer<typeof createTicketFormSchema>;

interface AdminCreateTicketFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  allUsers: User[];
  allTicketTypes: TicketType[];
  onCreateUser: (
    name: string,
    email: string,
    password: string,
    role: "attendee" | "admin"
  ) => Promise<User | null>;
  onCreateTicket: (
    userId: string,
    ticketTypeName: string
  ) => Promise<Ticket | null>;
}

export function AdminCreateTicketForm({
  isOpen,
  setIsOpen,
  allUsers,
  allTicketTypes,
  onCreateUser,
  onCreateTicket,
}: AdminCreateTicketFormProps) {
  const { toast } = useToast();

  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketFormSchema),
    defaultValues: {
      creationMode: "existing",
      userId: "",
      ticketTypeName:
        allTicketTypes && allTicketTypes.length > 0
          ? allTicketTypes[0].name
          : "",
    },
  });

  const watchedCreationMode = form.watch("creationMode");

  const sortedUsers = useMemo(
    () => [...(allUsers || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [allUsers]
  );
  const sortedTicketTypes = useMemo(
    () =>
      [...(allTicketTypes || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [allTicketTypes]
  );

  useEffect(() => {
    if (isOpen) {
      form.reset({
        creationMode: "existing",
        userId: "",
        ticketTypeName:
          sortedTicketTypes.length > 0 ? sortedTicketTypes[0].name : "",
      });
    }
  }, [isOpen, form, sortedTicketTypes, sortedUsers]); // Added sortedUsers

  useEffect(() => {
    if (watchedCreationMode === "existing") {
      form.setValue("newName", "");
      form.setValue("newEmail", "");
      form.setValue("newPassword", "");
      form.setValue("newConfirmPassword", "");
      form.setValue("newRole", "attendee");
    } else {
      // 'new' mode
      form.setValue("userId", "");
    }
  }, [watchedCreationMode, form]);

  async function onSubmit(values: CreateTicketFormValues) {
    let finalUserId: string | undefined = undefined;

    if (values.creationMode === "new") {
      // Imperative check for password confirmation, as .refine was problematic for discriminatedUnion construction
      if (values.newPassword !== values.newConfirmPassword) {
        form.setError("newConfirmPassword", {
          type: "manual",
          message: "Passwords don't match",
        });
        return;
      }
      const newUser = await onCreateUser(
        values.newName,
        values.newEmail,
        values.newPassword,
        values.newRole
      );
      if (newUser) {
        finalUserId = newUser.id;
        toast({
          title: "User Created",
          description: `User ${values.newName} created successfully.`,
        });
      } else {
        return;
      }
    } else {
      finalUserId = values.userId;
    }

    if (!finalUserId) {
      toast({
        title: "Error",
        description: "User ID is missing for ticket creation.",
        variant: "destructive",
      });
      return;
    }

    if (!values.ticketTypeName) {
      toast({
        title: "Error",
        description: "Ticket type is missing.",
        variant: "destructive",
      });
      return;
    }

    const ticket = await onCreateTicket(finalUserId, values.ticketTypeName);
    if (ticket) {
      const userName =
        values.creationMode === "new"
          ? (values as Extract<CreateTicketFormValues, { creationMode: "new" }>)
              .newName
          : (allUsers || []).find(
              (u) =>
                u.id ===
                (
                  values as Extract<
                    CreateTicketFormValues,
                    { creationMode: "existing" }
                  >
                ).userId
            )?.name;
      toast({
        title: "Ticket Created",
        description: `Ticket for ${userName || "user"} created.`,
      });
      setIsOpen(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 py-4 pr-2"
      >
        <FormField
          control={form.control}
          name="creationMode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>User Assignment</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem
                        value="existing"
                        id="existingUserTicket"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="existingUserTicket"
                      className="font-normal cursor-pointer"
                    >
                      Existing User
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="new" id="newUserTicket" />
                    </FormControl>
                    <FormLabel
                      htmlFor="newUserTicket"
                      className="font-normal cursor-pointer"
                    >
                      New User
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedCreationMode === "existing" && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Existing User</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sortedUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchedCreationMode === "new" && (
          <>
            <FormField
              control={form.control}
              name="newName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New User Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Jane Doe"
                      {...field}
                      icon={<UserIcon className="text-muted-foreground" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New User Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="e.g., jane.doe@example.com"
                      {...field}
                      icon={<Mail className="text-muted-foreground" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New User Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      icon={<Lock className="text-muted-foreground" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newConfirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New User Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      icon={<Lock className="text-muted-foreground" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New User Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "attendee"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="attendee">Attendee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="ticketTypeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ticket type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sortedTicketTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name} (£{type.price.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
