"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { useAuth } from "../../hooks/use-auth";
import type { Poll } from "../../types";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const pollFormSchema = z.object({
  question: z
    .string()
    .min(5, { message: "Poll question must be at least 5 characters." }),
  options: z
    .array(
      z.object({
        text: z.string().min(1, { message: "Option text cannot be empty." }),
      })
    )
    .min(2, { message: "Please provide at least two options for the poll." }),
});

type PollFormValues = z.infer<typeof pollFormSchema>;

interface PollFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function PollForm({ isOpen, setIsOpen }: PollFormProps) {
  const { createPoll } = useAuth();
  const { toast } = useToast();

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: "",
      options: [{ text: "" }, { text: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        question: "",
        options: [{ text: "" }, { text: "" }],
      });
    }
  }, [form, isOpen]);

  async function onSubmit(values: PollFormValues) {
    if (!createPoll) {
      toast({
        title: "Error",
        description: "Poll creation function is not available.",
        variant: "destructive",
      });
      return;
    }
    const pollData: Omit<Poll, "id"> = {
      question: values.question,
      options: values.options.map((opt) => ({
        id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: opt.text,
        votes: 0,
      })),
      isOpen: true,
      createdAt: new Date().toISOString(),
    };
    const success = await createPoll(pollData);

    if (success) {
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
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., What's your favorite session track?"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Poll Options</FormLabel>
          <FormDescription className="mb-2">
            Add at least two options for the poll.
          </FormDescription>
          <div className="space-y-3">
            {fields.map((item, index) => (
              <FormField
                key={item.id}
                control={form.control}
                name={`options.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder={`Option ${index + 1}`} {...field} />
                      </FormControl>
                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-9 w-9 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove option</span>
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ text: "" })}
            className="mt-3"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
          </Button>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Poll"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
