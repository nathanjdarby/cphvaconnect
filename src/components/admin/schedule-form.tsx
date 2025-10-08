"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
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
import { useAuth } from "../../hooks/use-auth";
import type { ScheduleEvent, Speaker, LocationType, EventFile } from "../../types";
import { format, parseISO, set } from "date-fns";
import { CalendarIcon, UploadCloud, X, Paperclip } from "lucide-react";
import { cn } from "../../lib/utils";
import { useToast } from "../../hooks/use-toast";

const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const MAX_EVENT_FILE_SIZE_MB = 5;
const MAX_EVENT_FILE_SIZE_BYTES = MAX_EVENT_FILE_SIZE_MB * 1024 * 1024;

// Client-side representation for staged files, including the File object
interface StagedClientFile extends EventFile {
  fileObject?: File; // For new uploads
}

const scheduleFormSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters." }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters." }),
    eventDate: z.date({ required_error: "Event date is required." }),
    startTime: z
      .string()
      .regex(timeRegex, { message: "Invalid start time format (HH:MM)." }),
    endTime: z
      .string()
      .regex(timeRegex, { message: "Invalid end time format (HH:MM)." }),
    speakerIds: z.array(z.string()).optional(),
    locationId: z.string().optional().nullable(), // Allow null
    offerDownloads: z.boolean().default(false),
    stagedFilesClient: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().min(1, "File name cannot be empty."),
          type: z.string(),
          size: z.number(),
          category: z.string().optional(),
          storageUrl: z.string().optional().nullable(),
          storagePath: z.string().optional().nullable(),
          fileObject: z.custom<File>().optional().nullable(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      const startDate = set(data.eventDate, {
        hours: parseInt(data.startTime.split(":")[0]),
        minutes: parseInt(data.startTime.split(":")[1]),
      });
      const endDate = set(data.eventDate, {
        hours: parseInt(data.endTime.split(":")[0]),
        minutes: parseInt(data.endTime.split(":")[1]),
      });
      return endDate > startDate;
    },
    {
      message: "End time must be after start time.",
      path: ["endTime"],
    }
  );

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  eventToEdit?: ScheduleEvent | null;
}

export function ScheduleForm({
  isOpen,
  setIsOpen,
  eventToEdit,
}: ScheduleFormProps) {
  const { addScheduleEvent, updateScheduleEvent, allSpeakers, allLocations } =
    useAuth();
  const { toast } = useToast();

  const [stagedFiles, setStagedFiles] = useState<StagedClientFile[]>([]);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      speakerIds: [],
      locationId: "__NONE__",
      offerDownloads: false,
      stagedFilesClient: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        form.reset({
          title: eventToEdit.title,
          description: eventToEdit.description,
          eventDate: eventToEdit.startTime
            ? parseISO(eventToEdit.startTime)
            : new Date(),
          startTime: eventToEdit.startTime
            ? format(parseISO(eventToEdit.startTime), "HH:mm")
            : "09:00",
          endTime: eventToEdit.endTime
            ? format(parseISO(eventToEdit.endTime), "HH:mm")
            : "10:00",
          speakerIds: eventToEdit.speakerIds || [],
          locationId: eventToEdit.locationId || "__NONE__",
          offerDownloads: eventToEdit.offerDownloads || false,
          stagedFilesClient: (eventToEdit.eventFiles || []).map((ef) => ({
            ...ef,
            storageUrl: ef.storageUrl || null,
            storagePath: ef.storagePath || null,
          })),
        });
        setStagedFiles(
          (eventToEdit.eventFiles || []).map((ef) => ({
            ...ef,
            storageUrl: ef.storageUrl || null,
            storagePath: ef.storagePath || null,
          }))
        );
      } else {
        form.reset({
          title: "",
          description: "",
          eventDate: new Date(),
          startTime: "09:00",
          endTime: "10:00",
          speakerIds: [],
          locationId: "__NONE__",
          offerDownloads: false,
          stagedFilesClient: [],
        });
        setStagedFiles([]);
      }
    }
  }, [eventToEdit, form, isOpen]);

  const sortedSpeakers = useMemo(() => {
    if (!allSpeakers) return [];
    return [...allSpeakers].sort((a, b) => a.name.localeCompare(b.name));
  }, [allSpeakers]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newClientFiles: StagedClientFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_EVENT_FILE_SIZE_BYTES) {
        toast({
          title: "File Too Large",
          description: `"${file.name}" exceeds ${MAX_EVENT_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        continue;
      }
      newClientFiles.push({
        id: `client-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        fileObject: file,
        category: "",
        storageUrl: null,
        storagePath: null,
      });
    }
    setStagedFiles((prev) => [...prev, ...newClientFiles]);
    form.setValue("stagedFilesClient", [
      ...(form.getValues("stagedFilesClient") || []),
      ...newClientFiles,
    ]);
    event.target.value = "";
  };

  const removeStagedFile = (fileIdToRemove: string) => {
    setStagedFiles((prev) => prev.filter((file) => file.id !== fileIdToRemove));
    form.setValue(
      "stagedFilesClient",
      (form.getValues("stagedFilesClient") || []).filter(
        (file) => file.id !== fileIdToRemove
      )
    );
  };

  const handleStagedFileCategoryChange = (fileId: string, category: string) => {
    const updated = stagedFiles.map((file) =>
      file.id === fileId ? { ...file, category } : file
    );
    setStagedFiles(updated);
    form.setValue("stagedFilesClient", updated);
  };

  async function onSubmit(values: ScheduleFormValues) {
    const combinedStartDateTime = set(values.eventDate, {
      hours: parseInt(values.startTime.split(":")[0]),
      minutes: parseInt(values.startTime.split(":")[1]),
      seconds: 0,
      milliseconds: 0,
    });
    const combinedEndDateTime = set(values.eventDate, {
      hours: parseInt(values.endTime.split(":")[0]),
      minutes: parseInt(values.endTime.split(":")[1]),
      seconds: 0,
      milliseconds: 0,
    });

    const eventDataPayload: Partial<ScheduleEvent> = {
      title: values.title,
      description: values.description,
      startTime: combinedStartDateTime.toISOString(),
      endTime: combinedEndDateTime.toISOString(),
      speakerIds: values.speakerIds,
      locationId: values.locationId === "__NONE__" ? null : values.locationId,
      offerDownloads: values.offerDownloads,
    };

    const filesToUploadForStorage: { file: File; category: string }[] = (
      values.stagedFilesClient || []
    )
      .filter((sf) => sf.fileObject)
      .map((sf) => ({ file: sf.fileObject!, category: sf.category || "" }));

    let success = false;
    if (eventToEdit) {
      if (!updateScheduleEvent) {
        toast({
          title: "Error",
          description: "Update fn not available",
          variant: "destructive",
        });
        return;
      }

      const clientFileIdsToKeep = new Set(
        (values.stagedFilesClient || []).map((f) => f.id)
      );

      const filesToRemoveFromStoragePaths = (eventToEdit.eventFiles || [])
        .filter(
          (originalFile) =>
            originalFile.storagePath &&
            !clientFileIdsToKeep.has(originalFile.id)
        )
        .map((file) => file.storagePath!);

      const existingFilesToKeepOrUpdate = (
        values.stagedFilesClient || []
      ).filter((sf) => sf.storagePath);

      const result = await updateScheduleEvent(
        eventToEdit.id,
        eventDataPayload,
        filesToUploadForStorage,
        filesToRemoveFromStoragePaths,
        existingFilesToKeepOrUpdate
      );
      if (result) success = true;
    } else {
      if (!addScheduleEvent) {
        toast({
          title: "Error",
          description: "Add fn not available",
          variant: "destructive",
        });
        return;
      }
      const result = await addScheduleEvent(
        eventDataPayload as Omit<ScheduleEvent, "id">,
        filesToUploadForStorage
      );
      if (result) success = true;
    }

    if (success) {
      setIsOpen(false);
    }
  }

  const offerDownloadsValue = form.watch("offerDownloads");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 py-4 pr-2 sm:max-w-xl overflow-y-auto"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Opening Keynote" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem className="flex flex-col md:col-span-1">
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Start Time (HH:MM)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>End Time (HH:MM)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || "__NONE__"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__NONE__">
                    No specific location / Online
                  </SelectItem>
                  {allLocations &&
                    allLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="speakerIds"
          render={() => (
            <FormItem>
              <FormLabel>Speakers</FormLabel>
              <FormDescription>Select one or more speakers.</FormDescription>
              <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1">
                {sortedSpeakers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No speakers available.
                  </p>
                )}
                {sortedSpeakers.map((speaker) => (
                  <FormField
                    key={speaker.id}
                    control={form.control}
                    name="speakerIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={speaker.id}
                          className="flex flex-row items-start space-x-3 space-y-0 bg-muted/30 p-2 rounded-md"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(speaker.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      speaker.id,
                                    ])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== speaker.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            {speaker.name}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({speaker.title})
                            </span>
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="offerDownloads"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="offerDownloads"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="offerDownloads" className="cursor-pointer">
                  Offer Downloads?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        {offerDownloadsValue && (
          <FormItem>
            <FormLabel className="flex items-center">
              <UploadCloud className="mr-2 h-5 w-5" />
              Upload Files
            </FormLabel>
            <FormDescription>
              Max {MAX_EVENT_FILE_SIZE_MB}MB each. Uploaded files are stored in
              Firebase Storage. For full persistence, Firebase Storage must be
              configured.
            </FormDescription>
            <FormControl>
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </FormControl>
            {stagedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-medium">Staged Files:</h4>
                <ul className="list-none space-y-2 rounded-md border p-2">
                  {stagedFiles.map((sf) => (
                    <li
                      key={sf.id}
                      className="flex items-center gap-2 p-1.5 bg-muted/40 rounded text-xs"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => removeStagedFile(sf.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                      <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-grow" title={sf.name}>
                        {sf.name}
                      </span>
                      <span className="text-muted-foreground">
                        ({(sf.size / 1024).toFixed(1)}KB)
                      </span>
                      <Input
                        type="text"
                        placeholder="Category"
                        defaultValue={sf.category || ""}
                        onChange={(e) =>
                          handleStagedFileCategoryChange(sf.id, e.target.value)
                        }
                        className="h-7 text-xs w-[120px] ml-1"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving..."
              : eventToEdit
              ? "Save Changes"
              : "Add Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
