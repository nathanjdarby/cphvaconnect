"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import type { Speaker } from "@/types";
import { UploadCloud, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const speakerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  imageFile: z
    .custom<File | null>(
      (val) =>
        val === null || (typeof window !== "undefined" && val instanceof File),
      {
        message: "Image must be a file.",
      }
    )
    .optional()
    .nullable()
    .refine((file) => {
      if (!file) return true;
      return file.size <= MAX_IMAGE_SIZE_BYTES;
    }, `Max file size is ${MAX_IMAGE_SIZE_MB}MB.`)
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Only .jpg, .jpeg, .png, .webp, .gif formats are supported."),
  imageUrl: z
    .string()
    .url({ message: "If providing an external URL, it must be valid." })
    .optional()
    .nullable()
    .or(z.literal("")),
  dataAiHint: z
    .string()
    .optional()
    .refine((value) => !value || value.split(" ").length <= 2, {
      message: "AI hint can be max two words.",
    }),
});

type SpeakerFormValues = z.infer<typeof speakerFormSchema>;

interface SpeakerFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  speakerToEdit?: Speaker | null;
}

export function SpeakerForm({
  isOpen,
  setIsOpen,
  speakerToEdit,
}: SpeakerFormProps) {
  const { addSpeaker, updateSpeaker } = useAuth();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<SpeakerFormValues>({
    resolver: zodResolver(speakerFormSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      imageFile: null,
      imageUrl: "",
      dataAiHint: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (speakerToEdit) {
        form.reset({
          name: speakerToEdit.name,
          title: speakerToEdit.title,
          bio: speakerToEdit.bio,
          imageFile: null,
          imageUrl: speakerToEdit.imageUrl || "",
          dataAiHint: speakerToEdit.dataAiHint || "",
        });
        setImagePreview(speakerToEdit.imageUrl);
      } else {
        form.reset({
          name: "",
          title: "",
          bio: "",
          imageFile: null,
          imageUrl: "",
          dataAiHint: "",
        });
        setImagePreview(null);
      }
    }
  }, [speakerToEdit, form, isOpen]);

  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("imageFile", file);
      form.setValue("imageUrl", ""); // Clear external URL if file is chosen
    } else {
      form.setValue("imageFile", null);
      if (!form.getValues("imageUrl")) {
        // If external URL is also empty
        setImagePreview(speakerToEdit?.imageUrl || null);
      }
    }
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    form.setValue("imageUrl", url);
    if (url && url.startsWith("http")) {
      setImagePreview(url);
      form.setValue("imageFile", null); // Clear file if URL is typed
    } else if (!url && form.getValues("imageFile")) {
      // Revert to file preview if URL is cleared and a file exists
      const file = form.getValues("imageFile");
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else if (!url) {
      setImagePreview(null);
    }
  };

  async function onSubmit(values: SpeakerFormValues) {
    const payload: Partial<Speaker> = {
      name: values.name,
      title: values.title,
      bio: values.bio,
      dataAiHint: values.dataAiHint,
      imageUrl: values.imageUrl || null, // Send existing/new URL or null
    };

    let success = false;
    if (speakerToEdit) {
      if (!updateSpeaker) {
        toast({
          title: "Error",
          description: "Update function not available",
          variant: "destructive",
        });
        return;
      }
      // If imageFile is present, it's a new upload/replacement. If not, but imageUrl is cleared, it's a removal.
      const removeImageFlag =
        !values.imageFile && !values.imageUrl && !!speakerToEdit.imageUrl;
      const result = await updateSpeaker(
        speakerToEdit.id,
        payload,
        values.imageFile,
        removeImageFlag
      );
      if (result) success = true;
    } else {
      if (!addSpeaker) {
        toast({
          title: "Error",
          description: "Add function not available",
          variant: "destructive",
        });
        return;
      }
      const result = await addSpeaker(
        payload as Omit<Speaker, "id">,
        values.imageFile
      );
      if (result) success = true;
    }

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dr. Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title / Affiliation</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Lead AI Researcher, Acme Corp"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief bio of the speaker..."
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageFile"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <UploadCloud className="mr-2 h-5 w-5" />
                Speaker Image
              </FormLabel>
              <FormDescription>
                Upload an image (max {MAX_IMAGE_SIZE_MB}MB) or provide an
                external URL below. Uploaded images are stored in Firebase
                Storage.
              </FormDescription>
              <FormControl>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={(e) => {
                    handleImageFileChange(e);
                    onChange(e.target.files?.[0] || null);
                  }}
                  className="cursor-pointer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Or External Image URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/image.png"
                  {...field}
                  value={field.value || ""}
                  onChange={handleImageUrlChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {imagePreview && (
          <div className="mt-2 relative w-32 h-32 rounded-md overflow-hidden border shadow-sm bg-muted">
            <NextImage
              src={imagePreview}
              alt="Image preview"
              fill
              className="object-cover"
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="dataAiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                AI Image Hint
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., professional person" {...field} />
              </FormControl>
              <FormDescription>
                Max two words. Helps generate better fallback images.
              </FormDescription>
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
            {form.formState.isSubmitting
              ? "Saving..."
              : speakerToEdit
              ? "Save Changes"
              : "Add Speaker"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
