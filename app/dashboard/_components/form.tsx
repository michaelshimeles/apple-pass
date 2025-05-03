"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    logoText: z.string().optional(),
    backgroundColor: z
        .string()
        .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid hex color")
        .optional(),
    logoUrl: z.string().optional(),
    stripImageFrontUrl: z.string().optional(),
    stripImageBackUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    backgroundUrl: z.string().optional(),
    primaryFieldLabel: z.string().optional(),
    primaryFieldValue: z.string().optional(),
    secondaryFieldLabel: z.string().optional(),
    secondaryFieldValue: z.string().optional(),
    auxiliaryFieldLabel: z.string().optional(),
    auxiliaryFieldValue: z.string().optional(),
    url: z.string().url("Must be a valid URL").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePassForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // Track current step
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            logoText: "",
            backgroundColor: "#000", // Default to same color as preview
            logoUrl: "",
            stripImageFrontUrl: "",
            stripImageBackUrl: "",
            thumbnailUrl: "",
            backgroundUrl: "",
            primaryFieldLabel: "",
            primaryFieldValue: "",
            secondaryFieldLabel: "",
            secondaryFieldValue: "",
            auxiliaryFieldLabel: "",
            auxiliaryFieldValue: "",
            url: "",
        },
    });

    const watched = useWatch({ control: form.control });

    const onSubmit = async (data: FormValues) => {
        console.log('data', data)
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

            toast.success("Pass created successfully");
            router.prefetch("/dashboard");
            router.push("/dashboard");
        } catch (err) {
            console.error("Error creating pass:", err);
            toast.error("Unexpected error");
            setLoading(false);
        }
    };

    const nextStep = () => setStep(2);
    const prevStep = () => setStep(1);

    return (
        <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto p-4 w-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full space-y-4"
                >
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>1</div>
                            <div className="h-1 w-16 bg-gray-200 mx-2"></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>2</div>
                        </div>
                        <div className="text-sm dark:text-white">
                            Step {step} of 2
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            {step === 1 ? (
                                <>
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                    </FormControl>
                                                    <FormDescription>Enter your name</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="logoText"
                                            render={({ field }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>Logo Text</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                    </FormControl>
                                                    <FormDescription>Text that appears next to the logo</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                </FormControl>
                                                <FormDescription>Enter your description</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Images */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="logoUrl"
                                            render={({ field: { onChange, ...field } }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>Logo</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={field.ref}
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    // read raw bytes
                                                                    const buf = await file.arrayBuffer();
                                                                    // send to your endpoint
                                                                    const res = await fetch("/api/upload-image", {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Content-Type": "application/octet-stream",
                                                                            "x-file-name": file.name,
                                                                        },
                                                                        body: buf,
                                                                    });
                                                                    if (!res.ok) {
                                                                        console.error("Upload failed", await res.text());
                                                                        toast.error("Upload failed");
                                                                        return;
                                                                    }
                                                                    const { url } = await res.json();
                                                                    toast.success("Upload successful");
                                                                    onChange(url);
                                                                } catch (error) {
                                                                    console.error("Upload error:", error);
                                                                    toast.error("Upload failed: " + (error instanceof Error ? error.message : String(error)));
                                                                }
                                                            }}
                                                            className="w-full border p-2 rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Upload logo image</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="thumbnailUrl"
                                            render={({ field: { value, onChange, ...field } }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>Thumbnail</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={field.ref}
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    // read raw bytes
                                                                    const buf = await file.arrayBuffer();
                                                                    // send to your endpoint
                                                                    const res = await fetch("/api/upload-image", {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Content-Type": "application/octet-stream",
                                                                            "x-file-name": file.name,
                                                                        },
                                                                        body: buf,
                                                                    });
                                                                    if (!res.ok) {
                                                                        console.error("Upload failed", await res.text());
                                                                        toast.error("Upload failed");
                                                                        return;
                                                                    }
                                                                    const { url } = await res.json();
                                                                    toast.success("Upload successful");
                                                                    onChange(url);
                                                                } catch (error) {
                                                                    console.error("Upload error:", error);
                                                                    toast.error("Upload failed: " + (error instanceof Error ? error.message : String(error)));
                                                                }
                                                            }}
                                                            className="w-full border p-2 rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Upload thumbnail image</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="stripImageFrontUrl"
                                            render={({ field: { value, onChange, ...field } }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>Strip Image (Front)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={field.ref}
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    // read raw bytes
                                                                    const buf = await file.arrayBuffer();
                                                                    // send to your endpoint
                                                                    const res = await fetch("/api/upload-image", {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Content-Type": "application/octet-stream",
                                                                            "x-file-name": file.name,
                                                                        },
                                                                        body: buf,
                                                                    });
                                                                    if (!res.ok) {
                                                                        console.error("Upload failed", await res.text());
                                                                        toast.error("Upload failed");
                                                                        return;
                                                                    }
                                                                    const { url } = await res.json();
                                                                    toast.success("Upload successful");
                                                                    onChange(url);
                                                                } catch (error) {
                                                                    console.error("Upload error:", error);
                                                                    toast.error("Upload failed: " + (error instanceof Error ? error.message : String(error)));
                                                                }
                                                            }}
                                                            className="w-full border p-2 rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Upload front strip image</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="stripImageBackUrl"
                                            render={({ field: { value, onChange, ...field } }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>Strip Image (Back)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={field.ref}
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    // read raw bytes
                                                                    const buf = await file.arrayBuffer();
                                                                    // send to your endpoint
                                                                    const res = await fetch("/api/upload-image", {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Content-Type": "application/octet-stream",
                                                                            "x-file-name": file.name,
                                                                        },
                                                                        body: buf,
                                                                    });
                                                                    if (!res.ok) {
                                                                        console.error("Upload failed", await res.text());
                                                                        toast.error("Upload failed");
                                                                        return;
                                                                    }
                                                                    const { url } = await res.json();
                                                                    toast.success("Upload successful");
                                                                    onChange(url);
                                                                } catch (error) {
                                                                    console.error("Upload error:", error);
                                                                    toast.error("Upload failed: " + (error instanceof Error ? error.message : String(error)));
                                                                }
                                                            }}
                                                            className="w-full border p-2 rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Upload back strip image</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="backgroundColor"
                                        render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Background Color</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="color" className="w-full h-10 p-1 rounded-md" />
                                                </FormControl>
                                                <FormDescription>Customize your pass background</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <div>
                                        {/* Primary Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="primaryFieldLabel"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>Primary Field Label</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                        </FormControl>
                                                        <FormDescription>Label shown for the primary field</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="primaryFieldValue"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>Primary Field Value</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                        </FormControl>
                                                        <FormDescription>Value for the primary field</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Secondary Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="secondaryFieldLabel"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>Secondary Field Label</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                        </FormControl>
                                                        <FormDescription>Label for the secondary field</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="secondaryFieldValue"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>Secondary Field Value</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                        </FormControl>
                                                        <FormDescription>Value for the secondary field</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Auxiliary Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="auxiliaryFieldLabel"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>Auxiliary Field Label</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                        </FormControl>
                                                        <FormDescription>Label for the auxiliary field</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="auxiliaryFieldValue"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>Auxiliary Field Value</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                        </FormControl>
                                                        <FormDescription>Value for the auxiliary field</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="url"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>Link / Website URL</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="url" className="w-full border p-2 rounded-md" />
                                                        </FormControl>
                                                        <FormDescription>Optional URL related to this pass</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="backgroundUrl"
                                        render={({ field: { value, onChange, ...field } }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Background Image</FormLabel>
                                                <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={field.ref}
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    // read raw bytes
                                                                    const buf = await file.arrayBuffer();
                                                                    // send to your endpoint
                                                                    const res = await fetch("/api/upload-image", {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Content-Type": "application/octet-stream",
                                                                            "x-file-name": file.name,
                                                                        },
                                                                        body: buf,
                                                                    });
                                                                    if (!res.ok) {
                                                                        console.error("Upload failed", await res.text());
                                                                        toast.error("Upload failed");
                                                                        return;
                                                                    }
                                                                    const { url } = await res.json();
                                                                    toast.success("Upload successful");
                                                                    onChange(url);
                                                                } catch (error) {
                                                                    console.error("Upload error:", error);
                                                                    toast.error("Upload failed: " + (error instanceof Error ? error.message : String(error)));
                                                                }
                                                            }}
                                                            className="w-full border p-2 rounded-md"
                                                        />
                                                </FormControl>
                                                <FormDescription>Upload background image</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-between mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            className="w-24"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="w-24"
                                        // disabled={loading}
                                        >
                                            {loading ? "Creating..." : "Submit"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="flex justify-end mt-6">
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="w-24"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </form>
            </Form>

            {/* 🔍 Live Preview */}
            <div className="flex items-center justify-center sticky top-4">
                <div
                    className="rounded-xl shadow-lg overflow-hidden text-white font-sans"
                    style={{
                        backgroundColor: watched.backgroundColor || "#b76d6d",
                        width: 320,
                        padding: 16,
                        backgroundImage: watched.backgroundUrl ? `url(${watched.backgroundUrl})` : "none",
                    }}
                >
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <div className="flex items-center gap-2">
                            {watched.logoUrl ? (
                                <img src={watched.logoUrl} alt="logo" className="w-6 h-6 rounded-full" />
                            ) : (
                                <span>{watched.logoText || "LOGO TEXT"}</span>
                            )}
                        </div>
                        <div className="text-right">
                            <div>POINTS</div>
                            <div className="text-lg">0</div>
                        </div>
                    </div>
                    <div className="w-full h-24 bg-white mb-2 flex items-center justify-center">
                        {watched.stripImageFrontUrl ? (
                            <img src={watched.stripImageFrontUrl} alt="strip" className="w-full h-full" />
                        ) : (
                            <span className="text-black text-xs">[strip image]</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold bg-black/10 px-2 py-2 rounded-md">
                        <div>
                            <div className="text-xs opacity-80">
                                {watched.primaryFieldLabel || "NAME"}
                            </div>
                            <div>{watched.primaryFieldValue || watched.name || "[displayName]"}</div>
                        </div>
                        <div>
                            <div className="text-xs opacity-80">
                                {watched.secondaryFieldLabel || "TIER"}
                            </div>
                            <div>{watched.secondaryFieldValue || "[tier]"}</div>
                        </div>
                    </div>
                    {watched.auxiliaryFieldLabel || watched.auxiliaryFieldValue ? (
                        <div className="mt-2 text-sm">
                            <div className="text-xs opacity-80">
                                {watched.auxiliaryFieldLabel}
                            </div>
                            <div>{watched.auxiliaryFieldValue}</div>
                        </div>
                    ) : null}
                    {watched.url && (
                        <div className="mt-2 text-xs text-center">
                            <a href={watched.url} className="underline" target="_blank" rel="noopener noreferrer">
                                Visit Website
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
