
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea'; 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ShieldAlert, UserCog, Eye, EyeOff, Lock, Download, AlertCircle, BookUser, ImageUp, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { User, Ticket } from '@/types';

const MAX_AVATAR_SIZE_MB = 2;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters."}).optional(),
  nameIsPublic: z.boolean().default(true),
  emailIsPublic: z.boolean().default(false),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
  avatarFile: z.custom<File | null>((val) => val === null || (typeof window !== 'undefined' && val instanceof File), { // Changed FileList to File
      message: "Avatar must be a file.",
    }).optional().nullable()
    .refine(
      (file) => { // Changed files to file
        if (!file) return true; 
        return file.size <= MAX_AVATAR_SIZE_BYTES;
      },
      `Max file size is ${MAX_AVATAR_SIZE_MB}MB.`
    )
    .refine(
      (file) => { // Changed files to file
        if (!file) return true;
        return ACCEPTED_IMAGE_TYPES.includes(file.type);
      },
      "Only .jpg, .jpeg, .png, .webp, .gif formats are supported."
    ),
  // avatarUrl is for displaying existing URL, not part of form data directly submitted for file upload logic
}).refine(data => {
  if (data.newPassword && data.newPassword.length < 6) {
    return false;
  }
  return true;
}, {
  message: "New password must be at least 6 characters.",
  path: ["newPassword"],
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match.",
  path: ["confirmNewPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const { user, loading, updateUserProfile, userTickets } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // For clearing file input

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      nameIsPublic: true,
      emailIsPublic: false,
      newPassword: '',
      confirmNewPassword: '',
      avatarFile: null,
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        nameIsPublic: user.nameIsPublic === undefined ? true : user.nameIsPublic,
        emailIsPublic: user.emailIsPublic === undefined ? false : user.emailIsPublic,
        newPassword: '',
        confirmNewPassword: '',
        avatarFile: null, // Reset file input on form reset
      });
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user, loading, router, form]);

  if (loading) {
    return <div className="text-center py-10"><p>Loading profile...</p></div>;
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-3">Access Denied</h2>
        <p className="text-muted-foreground">You must be logged in to edit your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        form.setError("avatarFile", { type: "manual", message: `File is too large (max ${MAX_AVATAR_SIZE_MB}MB).` });
        setAvatarPreview(user?.avatarUrl || null); // Revert to old preview if error
        form.setValue('avatarFile', null);
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError("avatarFile", { type: "manual", message: "Invalid file type." });
        setAvatarPreview(user?.avatarUrl || null); // Revert to old preview if error
        form.setValue('avatarFile', null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('avatarFile', file); // Store the File object
      form.clearErrors("avatarFile");
    } else { // No file selected (e.g., user cancelled selection)
      setAvatarPreview(user?.avatarUrl || null); // Revert to original if they cancel
      form.setValue('avatarFile', null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    form.setValue('avatarFile', null); 
    if(fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input visually
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    const profileUpdates: Partial<Pick<User, 'name' | 'email' | 'nameIsPublic' | 'emailIsPublic' | 'bio'>> = {
      name: values.name,
      email: values.email,
      bio: values.bio,
      nameIsPublic: values.nameIsPublic,
      emailIsPublic: values.emailIsPublic,
    };
    const passwordUpdate = values.newPassword ? values.newPassword : undefined;
    
    // Determine if avatar is being removed or a new one uploaded
    let removeAvatarFlag = false;
    if (user?.avatarUrl && !values.avatarFile && !avatarPreview) { // Avatar was present, no new file, and preview is cleared
      removeAvatarFlag = true;
    }

    const success = await updateUserProfile(
        user.id, 
        profileUpdates, 
        passwordUpdate, 
        values.avatarFile, // Pass the File object
        removeAvatarFlag
    );

    if (success) {
      toast({title: "Profile updated successfully!"});
      router.push(`/users/${user.id}`); 
    }
  };

  const handleDownloadData = () => {
    if (!user) return;
    const userData = {
      profile: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        nameIsPublic: user.nameIsPublic, emailIsPublic: user.emailIsPublic,
        bio: user.bio, avatarUrl: user.avatarUrl, avatarStoragePath: user.avatarStoragePath
      },
      tickets: userTickets.map(ticket => ({
        id: ticket.id, conferenceName: ticket.conferenceName, ticketType: ticket.ticketType,
        ticketPrice: ticket.ticketPrice, purchaseDate: ticket.purchaseDate,
        qrCodeValue: ticket.qrCodeValue, isCheckedIn: ticket.isCheckedIn,
        checkInTimestamp: ticket.checkInTimestamp,
      })),
    };
    const jsonString = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `my_cphva_data_${user.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    toast({ title: "Data Exported", description: "Your data has been downloaded." });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <UserCog className="mr-3 h-8 w-8 text-accent" />
                Edit Your Profile
            </CardTitle>
            <CardDescription>Update your personal details, bio, privacy settings, and profile photo. You can also download your data.</CardDescription>
        </CardHeader>
        <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="avatarFile"
              render={({ field }) => ( // field.value here will be the File object or null
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="Avatar preview" width={80} height={80} className="rounded-full object-cover aspect-square border" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border">
                        <ImageUp className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <FormControl>
                        <Input 
                          type="file" 
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          onChange={handleAvatarFileChange} // This sets avatarFile in form
                          className="cursor-pointer"
                          ref={fileInputRef}
                        />
                      </FormControl>
                      {(avatarPreview || user?.avatarUrl) && ( // Show remove button if there's any avatar (preview or existing)
                        <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Photo
                        </Button>
                      )}
                    </div>
                  </div>
                  <FormDescription>Max {MAX_AVATAR_SIZE_MB}MB. JPG, PNG, WEBP, GIF. Uploaded images are stored in Firebase Storage.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                    <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="nameIsPublic"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="nameIsPublic"
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="nameIsPublic" className="flex items-center cursor-pointer">
                        {field.value ? <Eye className="mr-2 h-4 w-4 text-green-600" /> : <EyeOff className="mr-2 h-4 w-4 text-red-600" />}
                        Make my name public
                    </FormLabel>
                    <FormDescription>
                        If checked, your name will be visible on your public profile.
                    </FormDescription>
                    </div>
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                    <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                     <FormDescription>If you change your email, you will need to use the new email to log in next time.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="emailIsPublic"
                render={({ field }) => (
                 <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="emailIsPublic"
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="emailIsPublic" className="flex items-center cursor-pointer">
                         {field.value ? <Eye className="mr-2 h-4 w-4 text-green-600" /> : <EyeOff className="mr-2 h-4 w-4 text-red-600" />}
                        Make my email public
                    </FormLabel>
                    <FormDescription>
                        If checked, your email address will be visible on your public profile.
                    </FormDescription>
                    </div>
                </FormItem>
                )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <BookUser className="mr-2 h-5 w-5 text-muted-foreground" />
                    Your Bio (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little about yourself..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed on your public profile if your name is also public. Max 500 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card className="bg-secondary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-primary/90 flex items-center"><Lock className="mr-2 h-5 w-5"/>Change Password (Optional)</CardTitle>
                    <CardDescription>Leave blank to keep your current password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmNewPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <div className="border-t pt-6 space-y-3">
                <h3 className="text-lg font-medium text-primary/80">Data Management</h3>
                <Button type="button" variant="outline" onClick={handleDownloadData}>
                  <Download className="mr-2 h-4 w-4" />
                  Download My Data (JSON)
                </Button>
                <p className="text-xs text-muted-foreground flex items-start">
                    <AlertCircle className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0 text-orange-500" />
                    To request full deletion of your account and all associated data, please contact the CPHVA Connect conference administrators.
                </p>
            </div>


            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/users/${user.id}`)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
            </form>
        </Form>
        </CardContent>
       </Card>
    </div>
  );
}
