"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import slug from "slug";
import { toast } from "sonner";
import * as z from "zod";
import { Mail, PlusCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// only validate companyName here
const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companySlug: z.string(),
  email: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Invalid email",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function Step2({ prevStepAction }: { prevStepAction: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invites, setInvites] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyName: "", companySlug: "", email: "" },
  });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const companyName = watch("companyName");
  const router = useRouter();

  useEffect(() => {
    const slugified = slug(companyName || "");
    form.setValue("companySlug", slugified);
  }, [companyName, form]);

  const currentEmail = watch("email");
  const handleAddEmail = () => {
    if (!currentEmail) return;
    // simple regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
      toast("Invalid email");
      return;
    }
    if (invites.includes(currentEmail)) {
      toast.error("That email’s already invited");
      return;
    }
    setInvites((prev) => [...prev, currentEmail]);
    setValue("email", "");
  };

  const handleRemoveEmail = (email: string) =>
    setInvites((prev) => prev.filter((e) => e !== email));

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await authClient.organization.create({
        name: data?.companyName,
        slug: data?.companySlug,
        metadata: data,
      });

      router.push("/dashboard");
      reset();
    } catch (error) {
      toast.error("Oops, something went wrong");
      console.log("error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg hover:shadow-xl transition">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create your organization</CardTitle>
            <CardDescription>
              Set up your org and invite your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* companyName */}
            <FormField
              control={control}
              name="companyName"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Company name</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Acme Inc."
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="companySlug"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Company Slug</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="acme-inc"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* invite emails */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Invite team members</FormLabel>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                        <Mail className="h-4 w-4" />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="colleague@example.com"
                          className="pl-10"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddEmail();
                            }
                          }}
                        />
                      </FormControl>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="shrink-0"
                      onClick={handleAddEmail}
                      disabled={!field.value}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Add email</span>
                    </Button>
                  </div>
                  <FormMessage>{errors.email?.message}</FormMessage>
                  {invites.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {invites.map((email) => (
                        <Badge
                          key={email}
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="p-0.5 rounded-full hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3 text-destructive" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="mt-3 flex justify-between items-center">
            <Button variant="outline" onClick={prevStepAction}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
