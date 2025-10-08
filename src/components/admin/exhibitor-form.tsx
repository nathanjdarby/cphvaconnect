"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../components/ui/form";
import { useAuth } from "../../hooks/use-auth";
import type { ExhibitorType } from "../../types";
import { UploadCloud, Info } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import NextImage from "next/image";

const MAX_LOGO_SIZE_MB = 2;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const exhibitorFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  logoFile: z
    .custom<File | null>(
      (val) =>
        val === null || (typeof window !== "undefined" && val instanceof File)
    )
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_LOGO_SIZE_BYTES,
      `Max file size is ${MAX_LOGO_SIZE_MB}MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp, .gif formats are supported."
    ),
  logoUrl: z
    .string()
    .url({ message: "If providing an external URL, it must be valid." })
    .optional()
    .nullable()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  boothNumber: z.string().optional(),
  dataAiHint: z
    .string()
    .optional()
    .refine((value) => !value || value.split(" ").length <= 2, {
      message: "AI hint can be max two words.",
    }),
});

type ExhibitorFormValues = z.infer<typeof exhibitorFormSchema>;

interface ExhibitorFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  exhibitorToEdit?: ExhibitorType | null;
}

export function ExhibitorForm({
  isOpen,
  setIsOpen,
  exhibitorToEdit,
}: ExhibitorFormProps) {
  const { addExhibitor, updateExhibitor } = useAuth();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<ExhibitorFormValues>({
    resolver: zodResolver(exhibitorFormSchema),
    defaultValues: {
      name: "",
      description: "",
      logoFile: null,
      logoUrl: "",
      websiteUrl: "",
      boothNumber: "",
      dataAiHint: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (exhibitorToEdit) {
        form.reset({
          name: exhibitorToEdit.name,
          description: exhibitorToEdit.description,
          logoFile: null,
          logoUrl: exhibitorToEdit.logoUrl || "",
          websiteUrl: exhibitorToEdit.websiteUrl || "",
          boothNumber: exhibitorToEdit.boothNumber || "",
          dataAiHint: exhibitorToEdit.dataAiHint || "",
        });
        setLogoPreview(exhibitorToEdit.logoUrl);
      } else {
        form.reset({
          name: "",
          description: "",
          logoFile: null,
          logoUrl: "",
          websiteUrl: "",
          boothNumber: "",
          dataAiHint: "",
        });
        setLogoPreview(null);
      }
    }
  }, [exhibitorToEdit, form, isOpen]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      form.setValue("logoFile", file);
      form.setValue("logoUrl", "");
    } else {
      form.setValue("logoFile", null);
      if (!form.getValues("logoUrl")) {
        setLogoPreview(exhibitorToEdit?.logoUrl || null);
      }
    }
  };

  const handleLogoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    form.setValue("logoUrl", url);
    if (url && url.startsWith("http")) {
      setLogoPreview(url);
      form.setValue("logoFile", null);
    } else if (!url && form.getValues("logoFile")) {
      const file = form.getValues("logoFile");
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else if (!url) {
      setLogoPreview(null);
    }
  };

  async function onSubmit(values: ExhibitorFormValues) {
    const payload: Partial<ExhibitorType> = {
      name: values.name,
      description: values.description,
      websiteUrl: values.websiteUrl,
      boothNumber: values.boothNumber,
      dataAiHint: values.dataAiHint,
      logoUrl: values.logoUrl || null,
    };

    let success = false;
    if (exhibitorToEdit) {
      if (!updateExhibitor) {
        toast({
          title: "Error",
          description: "Update fn not available",
          variant: "destructive",
        });
        return;
      }
      const removeLogoFlag =
        !values.logoFile && !values.logoUrl && !!exhibitorToEdit.logoUrl;
      const result = await updateExhibitor(
        exhibitorToEdit.id,
        payload,
        values.logoFile,
        removeLogoFlag
      );
      if (result) success = true;
    } else {
      if (!addExhibitor) {
        toast({
          title: "Error",
          description: "Add fn not available",
          variant: "destructive",
        });
        return;
      }
      const result = await addExhibitor(
        payload as Omit<ExhibitorType, "id">,
        values.logoFile
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
              <FormLabel>Exhibitor Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., FutureTech Solutions" {...field} />
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
                  placeholder="Brief description..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoFile"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <UploadCloud className="mr-2 h-5 w-5" />
                Exhibitor Logo
              </FormLabel>
              <FormDescription>
                Upload a logo (max {MAX_LOGO_SIZE_MB}MB) or provide an external
                URL below. Uploaded logos are stored in Firebase Storage.
              </FormDescription>
              <FormControl>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={(e) => {
                    handleLogoFileChange(e);
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
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Or External Logo URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...field}
                  value={field.value || ""}
                  onChange={handleLogoUrlChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {logoPreview && (
          <div className="mt-2 relative w-40 h-24 rounded-md border shadow-sm bg-muted flex items-center justify-center">
            <NextImage
              src={logoPreview}
              alt="Logo preview"
              layout="fill"
              objectFit="contain"
              className="p-1"
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="boothNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booth Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., A101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataAiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                AI Logo Hint
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., tech company" {...field} />
              </FormControl>
              <FormDescription>
                Max two words. Helps generate better fallback logos.
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
              : exhibitorToEdit
              ? "Save Changes"
              : "Add Exhibitor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
