"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePassForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = (async (data: FormValues) => {
        try {
            setLoading(true);
            const response = await fetch("/api/create-pass", {
                method: "POST",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                toast.error("Failed to create pass");
                return;
            }

            console.log('response', response)
            toast.success("Pass created successfully");

            router.prefetch("/dashboard");
            router.push("/dashboard");
            
        } catch (err) {
            console.error("Error creating pass:", err);
            toast.error("Unexpected error");
            setLoading(false);
        } 
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="text"
                                    className="w-full border p-2 rounded-md"
                                />
                            </FormControl>
                            <FormDescription>Enter your name</FormDescription>
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
                                <Input
                                    {...field}
                                    type="text"
                                    className="w-full border p-2 rounded-md"
                                />
                            </FormControl>
                            <FormDescription>Enter your description</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="mt-4" disabled={loading}>
                    {loading ? "Creating Pass..." : "Submit"}
                </Button>
            </form>
        </Form>
    );
}