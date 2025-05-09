"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeCanvas } from "qrcode.react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required").optional(),
    logoText: z.string().optional(),
    headerFieldLabel: z.string().optional(),
    headerFieldValue: z.string().optional(),
    backgroundColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid hex color").optional(),
    logoUrl: z.string().optional(),
    stripImageFrontUrl: z.string().optional(),
    secondaryFieldLabel: z.string().optional(),
    secondaryFieldValue: z.string().optional(),
    auxiliaryFieldLabel: z.string().optional(),
    auxiliaryFieldValue: z.string().optional(),
    barcodeFormat: z.enum(["PKBarcodeFormatQR", "PKBarcodeFormatPDF417", "PKBarcodeFormatAztec", "PKBarcodeFormatCode128"]).optional(),
    barcodeValue: z.string().optional(),
    barcodeAltText: z.string().optional(),
    barcodeEncoding: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePassForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<number>(1);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "Pass Name",
            description: "Virtual | Premium",
            logoUrl: "",
            logoText: "",
            headerFieldLabel: "Expiration Date",
            headerFieldValue: "Mar 3, 2025",
            backgroundColor: "#8ba5a2",
            stripImageFrontUrl: "",
            secondaryFieldLabel: "Date",
            secondaryFieldValue: "Mar 3, 2025",
            auxiliaryFieldLabel: "Auxiliary Field Label",
            auxiliaryFieldValue: "Auxiliary Field Value",
            barcodeFormat: "PKBarcodeFormatQR",
            barcodeValue: "1234567890",
            barcodeAltText: "Apple Pass",
            barcodeEncoding: "iso-8859-1",
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
                const errorText = await response.text();
                toast.error(`Failed to create pass: ${response.status} ${errorText}`);
                setLoading(false);
                return;
            }

            toast.success("Pass created successfully");
            router.prefetch("/dashboard");
            router.push("/dashboard");
        } catch (err) {
            console.error("Error creating pass:", err);
            toast.error("Unexpected error during pass creation");
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="grid grid-cols-2 gap-8 w-full">
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
                            <div className="h-1 w-16 bg-gray-200 mx-2"></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>3</div>
                        </div>
                        <div className="text-sm dark:text-white">
                            Step {step} of 3
                        </div>
                    </div>

                    <div className="space-y-4">
                        {step === 1 && (
                            <>
                                {/* Basic Info */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="mt-4">
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                            </FormControl>
                                            <FormDescription>This will not be on the pass (for organizational purposes)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.formState.errors.name?.message && (
                                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.name?.message}</p>
                                )}

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="mt-4">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} className="w-full border p-2 rounded-md" />
                                            </FormControl>
                                            <FormDescription>Describe the purpose of your pass</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.formState.errors.description?.message && (
                                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.description?.message}</p>
                                )}
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

                                                            // Check image dimensions before upload
                                                            const img = new Image();
                                                            const objectUrl = URL.createObjectURL(file);
                                                            let processedFile = file; // Use original file by default
                                                            const targetMimeType = "image/png"; // Always aim for PNG
                                                            const originalFileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                                                            try {
                                                                await new Promise<void>((resolve, reject) => {
                                                                    img.onload = () => resolve();
                                                                    img.onerror = () => reject(new Error('Failed to load image'));
                                                                    img.src = objectUrl;
                                                                });

                                                                const needsResize = img.width > 160;
                                                                const needsTypeConversion = file.type !== targetMimeType;

                                                                if (needsResize || needsTypeConversion) {
                                                                    if (needsResize && needsTypeConversion) {
                                                                        toast.info('Resizing and converting to PNG...');
                                                                    } else if (needsResize) {
                                                                        toast.info('Logo image is too wide, resizing to 160px width...');
                                                                    } else if (needsTypeConversion) {
                                                                        toast.info(`Converting to ${targetMimeType}...`);
                                                                    }

                                                                    const canvas = document.createElement('canvas');
                                                                    const ctx = canvas.getContext('2d');
                                                                    if (!ctx) {
                                                                        throw new Error('Failed to get canvas context');
                                                                    }

                                                                    const aspectRatio = img.height / img.width;
                                                                    canvas.width = needsResize ? 160 : img.width;
                                                                    canvas.height = needsResize ? (160 * aspectRatio) : img.height;

                                                                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                                                                    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, targetMimeType, 0.95));
                                                                    if (!blob) {
                                                                        throw new Error('Failed to convert canvas to blob');
                                                                    }
                                                                    processedFile = new File([blob], `${originalFileNameWithoutExtension}.png`, {
                                                                        type: targetMimeType,
                                                                        lastModified: Date.now(),
                                                                    });
                                                                    toast.success('Logo processed successfully');
                                                                }
                                                            } catch (error) {
                                                                console.error("Image processing error:", error);
                                                                toast.error("Image processing failed: " + (error instanceof Error ? error.message : String(error)));
                                                                URL.revokeObjectURL(objectUrl);
                                                                return;
                                                            } finally {
                                                                URL.revokeObjectURL(objectUrl); // Ensure cleanup in all cases
                                                            }

                                                            try {
                                                                // read raw bytes from the potentially processed file
                                                                const buf = await processedFile.arrayBuffer();
                                                                // send to your endpoint
                                                                const res = await fetch("/api/upload-image", {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/octet-stream", // Server expects raw bytes
                                                                        "x-file-name": processedFile.name,
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
                                    {form.formState.errors.logoUrl?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.logoUrl?.message}</p>
                                    )}
                                    {!watched?.logoUrl && <FormField
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
                                    />}
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
                                {form.formState.errors.backgroundColor?.message && (
                                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.backgroundColor?.message}</p>
                                )}
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">

                                    <FormField
                                        control={form.control}
                                        name="headerFieldLabel"
                                        render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Header Field Label</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                </FormControl>
                                                <FormDescription>Label for the header field</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {form.formState.errors.headerFieldLabel?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.headerFieldLabel?.message}</p>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="headerFieldValue"
                                        render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Header Field Value</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                </FormControl>
                                                <FormDescription>Value for the header field</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {form.formState.errors.headerFieldValue?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.headerFieldValue?.message}</p>
                                    )}
                                </div>
                                {/* Images */}
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="stripImageFrontUrl"
                                        render={({ field: { onChange, ...field } }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Strip Image</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={field.ref}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];

                                                            if (!file) return;

                                                            // Check image dimensions before upload
                                                            const img = new Image();
                                                            const objectUrl = URL.createObjectURL(file);
                                                            let processedFile = file; // Use original file by default
                                                            const targetMimeType = "image/png"; // Always aim for PNG
                                                            const originalFileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                                                            try {
                                                                await new Promise<void>((resolve, reject) => {
                                                                    img.onload = () => resolve();
                                                                    img.onerror = () => reject(new Error('Failed to load image'));
                                                                    img.src = objectUrl;
                                                                });

                                                                const needsResize = img.width > 160;
                                                                const needsTypeConversion = file.type !== targetMimeType;

                                                                if (needsResize || needsTypeConversion) {
                                                                    if (needsResize && needsTypeConversion) {
                                                                        toast.info('Resizing and converting to PNG...');
                                                                    } else if (needsResize) {
                                                                        toast.info('Logo image is too wide, resizing to 160px width...');
                                                                    } else if (needsTypeConversion) {
                                                                        toast.info(`Converting to ${targetMimeType}...`);
                                                                    }

                                                                    const canvas = document.createElement('canvas');
                                                                    const ctx = canvas.getContext('2d');
                                                                    if (!ctx) {
                                                                        throw new Error('Failed to get canvas context');
                                                                    }

                                                                    const aspectRatio = img.height / img.width;
                                                                    canvas.width = needsResize ? 144 : img.width;
                                                                    canvas.height = needsResize ? (144 * aspectRatio) : img.height;

                                                                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                                                                    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, targetMimeType, 0.95));
                                                                    if (!blob) {
                                                                        throw new Error('Failed to convert canvas to blob');
                                                                    }
                                                                    processedFile = new File([blob], `${originalFileNameWithoutExtension}.png`, {
                                                                        type: targetMimeType,
                                                                        lastModified: Date.now(),
                                                                    });
                                                                    toast.success('Logo processed successfully');
                                                                }
                                                            } catch (error) {
                                                                console.error("Image processing error:", error);
                                                                toast.error("Image processing failed: " + (error instanceof Error ? error.message : String(error)));
                                                                URL.revokeObjectURL(objectUrl);
                                                                return;
                                                            } finally {
                                                                URL.revokeObjectURL(objectUrl); // Ensure cleanup in all cases
                                                            }

                                                            try {
                                                                // read raw bytes from the potentially processed file
                                                                const buf = await processedFile.arrayBuffer();
                                                                // send to your endpoint
                                                                const res = await fetch("/api/upload-image", {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/octet-stream", // Server expects raw bytes
                                                                        "x-file-name": processedFile.name,
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
                                    {form.formState.errors.stripImageFrontUrl?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.stripImageFrontUrl?.message}</p>
                                    )}
                                </div>
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
                                    {form.formState.errors.secondaryFieldLabel?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.secondaryFieldLabel?.message}</p>
                                    )}
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
                                    {form.formState.errors.secondaryFieldValue?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.secondaryFieldValue?.message}</p>
                                    )}
                                </div>
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
                                    {form.formState.errors.auxiliaryFieldLabel?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.auxiliaryFieldLabel?.message}</p>
                                    )}
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
                                    {form.formState.errors.auxiliaryFieldValue?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.auxiliaryFieldValue?.message}</p>
                                    )}
                                </div>

                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="space-y-2 pt-4 border-t mt-4">
                                    <FormField
                                        control={form.control}
                                        name="barcodeFormat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Barcode Format</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a barcode format" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PKBarcodeFormatQR">QR Code</SelectItem>
                                                        <SelectItem value="PKBarcodeFormatPDF417">PDF417</SelectItem>
                                                        <SelectItem value="PKBarcodeFormatAztec">Aztec</SelectItem>
                                                        <SelectItem value="PKBarcodeFormatCode128">Code 128</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Choose the barcode format.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {form.formState.errors.barcodeFormat?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.barcodeFormat?.message}</p>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="barcodeValue"
                                        render={({ field }) => (
                                            <FormItem className="mt-2">
                                                <FormLabel>Barcode Message</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                </FormControl>
                                                <FormDescription>The message to encode in the barcode.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {form.formState.errors.barcodeValue?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.barcodeValue?.message}</p>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="barcodeAltText"
                                        render={({ field }) => (
                                            <FormItem className="mt-2">
                                                <FormLabel>Barcode Alternate Text</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                </FormControl>
                                                <FormDescription>Text displayed near the barcode (e.g., for accessibility).</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {form.formState.errors.barcodeAltText?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.barcodeAltText?.message}</p>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="barcodeEncoding"
                                        render={({ field }) => (
                                            <FormItem className="mt-2">
                                                <FormLabel>Barcode Message Encoding</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="text" className="w-full border p-2 rounded-md" />
                                                </FormControl>
                                                <FormDescription>The encoding for the barcode message.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {form.formState.errors.barcodeEncoding?.message && (
                                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.barcodeEncoding?.message}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-between mt-6">
                        {step > 1 && (
                            <Button
                                type="button"
                                onClick={prevStep}
                                variant="outline"
                                className="w-24"
                            >
                                Previous
                            </Button>
                        )}
                        {step < 3 && (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="w-24"
                            >
                                Next
                            </Button>
                        )}
                        {step === 3 && (
                            <Button
                                type="submit"
                                className="w-24"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Submit"}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
            {/* 🔍 Live Preview */}
            <div className="flex items-center justify-center sticky top-4">
                <div
                    className="rounded shadow-lg overflow-hidden text-white font-sans"
                    style={{
                        backgroundColor: watched.backgroundColor,
                        width: 400,
                        padding: 16,
                        height: 500,
                    }}
                >
                    <div className="flex justify-between items-center font-semibold mb-2">
                        <div className="flex items-center gap-2 text-xs">
                            {watched.logoUrl ? (
                                <img src={watched.logoUrl} alt="logo" className="w-7" />
                            ) : (
                                <span>{watched.logoText || "LOGO TEXT"}</span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-semibold">{watched.headerFieldLabel || "Header Field Label"}</div>
                            <div className="text-md font-medium">{watched.headerFieldValue || "Header Field Value"}</div>
                        </div>
                    </div>
                    <div className="w-full h-24 bg-zinc-900 mb-2 flex items-center justify-center">
                        {watched.stripImageFrontUrl ? (
                            <img src={watched.stripImageFrontUrl} alt="strip" className="w-full h-full" />
                        ) : (
                            <span className="text-white text-xs">[strip image]</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold py-2 rounded-md">
                        <div>
                            <div className="text-xs font-semibold">
                                {watched.secondaryFieldLabel || "Secondary Field Label"}
                            </div>
                            <div className="text-xs font-medium">{watched.secondaryFieldValue || "secondaryFieldValue"}</div>
                        </div>
                        {watched.auxiliaryFieldLabel || watched.auxiliaryFieldValue ? (
                            <div>
                                <div className="text-xs font-semibold">
                                    {watched.auxiliaryFieldLabel || "auxiliaryFieldLabel"}
                                </div>
                                <div className="text-xs font-medium">{watched.auxiliaryFieldValue || "auxiliaryFieldValue"}</div>
                            </div>
                        ) : null}
                    </div>
                    {watched.barcodeFormat && (
                        <div className="flex items-center justify-center pb-25 h-full">
                            <div className="flex flex-col items-center justify-center bg-white p-2 rounded">
                                <QRCodeCanvas
                                    size={150}
                                    value={watched?.barcodeAltText || ""}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
