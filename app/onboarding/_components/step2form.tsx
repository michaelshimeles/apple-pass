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

// only validate companyName here
const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companySlug: z.string().min(1, "Company slug is required").regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Invalid company slug"
  ),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyName: "", companySlug: "", email: "" },
  });

  const { handleSubmit, control, reset, watch } = form;

  const companyName = watch("companyName");
  const router = useRouter();

  useEffect(() => {
    const slugified = slug(companyName || "");
    form.setValue("companySlug", slugified);
  }, [companyName, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    let success = false;

    try {
      await authClient.organization.create({
        name: data?.companyName,
        slug: data?.companySlug,
        metadata: data,
      });

      success = true;
    } catch (error) {
      toast.error("Oops, something went wrong");
      console.log("error", error);
    } finally {
      setIsSubmitting(false);
    }

    if (success) {
      reset();
      router.push("/dashboard");
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
