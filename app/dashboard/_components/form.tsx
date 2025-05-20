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
import { Textarea } from "@/components/ui/textarea";
import { ApplePass } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Pass from "@/app/share/_components/pass";
import { balloons, textBalloons } from "balloons-js";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters"),
  description: z
    .string()
    .max(1150, "Description cannot exceed 150 cahracter")
    .optional(),
  header_field_label: z
    .string()
    .max(25, "Header label cannot exceed 25 characters")
    .optional(),
  header_field_value: z
    .string()
    .max(30, "Header value cannot exceed 30 characters")
    .optional(),
  text_color: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid hex color")
    .optional(),
  background_color: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid hex color")
    .optional(),
  logo_url: z.string().optional(),
  strip_image: z.string().optional(),
  secondary_left_label: z
    .string()
    .max(25, "Primary label cannot exceed 25 characters"),
  secondary_left_value: z
    .string()
    .max(25, "Primary value cannot exceed 30 characters"),
  secondary_right_label: z
    .string()
    .max(25, "Secondary label cannot exceed 25 characters")
    .optional(),
  secondary_right_value: z
    .string()
    .max(30, "Secondary value cannot exceed 30 characters")
    .optional(),
  barcode_format: z
    .enum([
      "PKBarcodeFormatQR",
      "PKBarcodeFormatPDF417",
      "PKBarcodeFormatAztec",
      "PKBarcodeFormatCode128",
    ])
    .optional(),
  barcode_value: z
    .string()
    .max(500, "Barcode message cannot exceed 500 characters")
    .optional(),
  barcode_alt_text: z
    .string()
    .max(30, "Barcode alt text cannot exceed 30 characters")
    .optional(),
  barcode_encoding: z
    .string()
    .max(20, "Encoding cannot exceed 20 characters")
    .optional(),
  website_url: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePassForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Exodus Labs",
      description: "A pass for the employees of Exodus Labs",
      logo_url: "",
      header_field_label: "SPECIAL OFFERS",
      header_field_value: "TAP ••• FOR OFFERS",
      text_color: "#FFFFFF",
      background_color: "#000000",
      strip_image: "",
      secondary_left_label: "Team",
      secondary_left_value: "Engineer",
      secondary_right_label: "Status",
      secondary_right_value: "Active",
      barcode_format: "PKBarcodeFormatQR",
      barcode_value: "",
      barcode_alt_text: "",
      barcode_encoding: "iso-8859-1",
      website_url: "https://google.com",
    },
  });

  const watched = useWatch({ control: form.control });

  const onSubmit = async (data: FormValues) => {
    console.log("data", data);
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
      balloons();
      textBalloons([
        {
          text: "Time to cook 🔥",
          fontSize: 120,
          color: "#000000",
        },
      ]);
    } catch (err) {
      console.error("Error creating pass:", err);
      toast.error("Unexpected error during pass creation");
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
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
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
              >
                1
              </div>
              <div className="h-1 w-16 bg-gray-200 mx-2"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
              >
                2
              </div>
            </div>
            <div className="text-sm dark:text-white">Step {step} of 2</div>
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
                      <div className="flex justify-between">
                        <FormLabel>Name</FormLabel>
                        <span className="text-xs text-gray-500">
                          {field.value?.length || 0}/50
                        </span>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          className="w-full border p-2 rounded-md"
                          maxLength={50}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be the pass name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.formState.errors.name?.message && (
                  <p className="text-red-500 text-sm mt-2">
                    {form.formState.errors.name?.message}
                  </p>
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <div className="flex justify-between">
                        <FormLabel>Description</FormLabel>
                        <span className="text-xs text-gray-500">
                          {field.value?.length || 0}/1150
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full border p-2 rounded-md"
                          maxLength={1150}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the purpose of your pass
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.formState.errors.description?.message && (
                  <p className="text-red-500 text-sm mt-2">
                    {form.formState.errors.description?.message}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <>
                    <FormField
                      control={form.control}
                      name="logo_url"
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
                                const originalFileNameWithoutExtension =
                                  file.name.substring(
                                    0,
                                    file.name.lastIndexOf("."),
                                  ) || file.name;

                                try {
                                  await new Promise<void>((resolve, reject) => {
                                    img.onload = () => resolve();
                                    img.onerror = () =>
                                      reject(new Error("Failed to load image"));
                                    img.src = objectUrl;
                                  });

                                  const needsResize = img.width > 160;
                                  const needsTypeConversion =
                                    file.type !== targetMimeType;

                                  if (needsResize || needsTypeConversion) {
                                    if (needsResize && needsTypeConversion) {
                                      toast.info(
                                        "Resizing and converting to PNG...",
                                      );
                                    } else if (needsResize) {
                                      toast.info(
                                        "Logo image is too wide, resizing to 160px width...",
                                      );
                                    } else if (needsTypeConversion) {
                                      toast.info(
                                        `Converting to ${targetMimeType}...`,
                                      );
                                    }

                                    const canvas =
                                      document.createElement("canvas");
                                    const ctx = canvas.getContext("2d");
                                    if (!ctx) {
                                      throw new Error(
                                        "Failed to get canvas context",
                                      );
                                    }

                                    const aspectRatio = img.height / img.width;
                                    canvas.width = needsResize
                                      ? 160
                                      : img.width;
                                    canvas.height = needsResize
                                      ? 160 * aspectRatio
                                      : img.height;

                                    ctx.drawImage(
                                      img,
                                      0,
                                      0,
                                      canvas.width,
                                      canvas.height,
                                    );

                                    const blob = await new Promise<Blob | null>(
                                      (resolve) =>
                                        canvas.toBlob(
                                          resolve,
                                          targetMimeType,
                                          0.95,
                                        ),
                                    );
                                    if (!blob) {
                                      throw new Error(
                                        "Failed to convert canvas to blob",
                                      );
                                    }
                                    processedFile = new File(
                                      [blob],
                                      `${originalFileNameWithoutExtension}.png`,
                                      {
                                        type: targetMimeType,
                                        lastModified: Date.now(),
                                      },
                                    );
                                    toast.success(
                                      "Logo processed successfully",
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "Image processing error:",
                                    error,
                                  );
                                  toast.error(
                                    "Image processing failed: " +
                                      (error instanceof Error
                                        ? error.message
                                        : String(error)),
                                  );
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
                                      "Content-Type":
                                        "application/octet-stream", // Server expects raw bytes
                                      "x-file-name": processedFile.name,
                                    },
                                    body: buf,
                                  });
                                  if (!res.ok) {
                                    console.error(
                                      "Upload failed",
                                      await res.text(),
                                    );
                                    toast.error("Upload failed");
                                    return;
                                  }
                                  const { url } = await res.json();
                                  toast.success("Upload successful");
                                  onChange(url);
                                } catch (error) {
                                  console.error("Upload error:", error);
                                  toast.error(
                                    "Upload failed: " +
                                      (error instanceof Error
                                        ? error.message
                                        : String(error)),
                                  );
                                }
                              }}
                              className="w-full border rounded-md"
                            />
                          </FormControl>
                          <FormDescription>
                            Upload logo image (Recommended: PNG format, 160px
                            wide, square aspect ratio)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.formState.errors.logo_url?.message && (
                      <p className="text-red-500 text-sm mt-2">
                        {form.formState.errors.logo_url?.message}
                      </p>
                    )}
                  </>
                  <>
                    <FormField
                      control={form.control}
                      name="strip_image"
                      render={({ field: { onChange, ...field } }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Thumbnail Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              ref={field.ref}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const isThumbnail = true;
                                const targetMimeType = "image/png";
                                const originalName = file.name.replace(
                                  /\.[^/.]+$/,
                                  "",
                                );

                                // Load image
                                const img = await new Promise<HTMLImageElement>(
                                  (res, rej) => {
                                    const url = URL.createObjectURL(file);
                                    const img = new Image();
                                    img.onload = () => {
                                      URL.revokeObjectURL(url);
                                      res(img);
                                    };
                                    img.onerror = () => {
                                      URL.revokeObjectURL(url);
                                      rej(new Error("Failed to load"));
                                    };
                                    img.src = url;
                                  },
                                );

                                // Always use strip image configuration for this upload
                                // (this is the strip image upload section)
                                const config = {
                                  // Strip image config - exact dimensions required by Apple
                                  height: 144, // Exact height required for 1x density
                                  width: 360,  // Recommended width for strip images
                                  enforceSquare: false,
                                  quality: 1.0, // Maximum quality for best results
                                  isStripImage: true, // Flag to indicate this is a strip image
                                  scale: window.devicePixelRatio || 1, // Use device pixel ratio for better quality
                                  minRatio: 0.5,  // Very wide images allowed
                                  maxRatio: 3.0   // Very tall images allowed
                                };

                                try {
                                  toast.info(
                                    "Optimizing image for best quality…",
                                  );
                                  const processedFile = await processImage(
                                    img,
                                    file,
                                    originalName,
                                    targetMimeType,
                                    config,
                                  );
                                  toast.success("Image processed successfully");

                                  // Upload
                                  const buf = await processedFile.arrayBuffer();
                                  const res = await fetch("/api/upload-image", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type":
                                        "application/octet-stream",
                                      "x-file-name": processedFile.name,
                                    },
                                    body: buf,
                                  });
                                  if (!res.ok)
                                    throw new Error(await res.text());
                                  const { url } = await res.json();
                                  toast.success("Upload successful");
                                  onChange(url);
                                } catch (err) {
                                  console.error(err);
                                  toast.error(
                                    "Image processing/upload failed: " +
                                      (err as Error).message,
                                  );
                                }
                              }}
                              className="w-full border rounded-md"
                            />
                          </FormControl>
                          <FormDescription>
                            Upload front strip image (Required: 144px height,
                            recommended width 750px, PNG format)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.formState.errors.strip_image?.message && (
                      <p className="text-red-500 text-sm mt-2">
                        {form.formState.errors.strip_image?.message}
                      </p>
                    )}
                  </>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="background_color"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Background Color</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="color"
                            className="w-full h-10 p-1 rounded-md"
                          />
                        </FormControl>
                        <FormDescription>
                          Customize your pass background
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.background_color?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.background_color?.message}
                    </p>
                  )}
                  <FormField
                    control={form.control}
                    name="text_color"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Text Color</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="color"
                            className="w-full h-10 p-1 rounded-md"
                          />
                        </FormControl>
                        <FormDescription>
                          Customize your text color
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.text_color?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.text_color?.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="header_field_label"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <div className="flex justify-between">
                          <FormLabel>Header Field Label</FormLabel>
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/25
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full border p-2 rounded-md"
                            maxLength={25}
                          />
                        </FormControl>
                        <FormDescription>
                          Label for the header field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.header_field_label?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.header_field_label?.message}
                    </p>
                  )}
                  <FormField
                    control={form.control}
                    name="header_field_value"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <div className="flex justify-between">
                          <FormLabel>Header Field Value</FormLabel>
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/30
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full border p-2 rounded-md"
                            maxLength={30}
                          />
                        </FormControl>
                        <FormDescription>
                          Value for the header field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.header_field_value?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.header_field_value?.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="secondary_left_label"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <div className="flex justify-between">
                          <FormLabel>Primary Field Label</FormLabel>
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/25
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full border p-2 rounded-md"
                            maxLength={25}
                          />
                        </FormControl>
                        <FormDescription>
                          Label for the secondary field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.secondary_left_label?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.secondary_left_label?.message}
                    </p>
                  )}
                  <FormField
                    control={form.control}
                    name="secondary_left_value"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <div className="flex justify-between">
                          <FormLabel>Primary Field Value</FormLabel>
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/30
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full border p-2 rounded-md"
                            maxLength={30}
                          />
                        </FormControl>
                        <FormDescription>
                          Value for the primary field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.secondary_left_value?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.secondary_left_value?.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="secondary_right_label"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <div className="flex justify-between">
                          <FormLabel>Secondary Field Label</FormLabel>
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/25
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full border p-2 rounded-md"
                            maxLength={25}
                          />
                        </FormControl>
                        <FormDescription>
                          Label for the secondary field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.secondary_right_label?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.secondary_right_label?.message}
                    </p>
                  )}
                  <FormField
                    control={form.control}
                    name="secondary_right_value"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <div className="flex justify-between">
                          <FormLabel>Secondary Field Value</FormLabel>
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/30
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full border p-2 rounded-md"
                            maxLength={30}
                          />
                        </FormControl>
                        <FormDescription>
                          Value for the secondary field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.secondary_right_value?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.secondary_right_value?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 pt-4 border-t mt-4">
                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <div className="flex justify-between">
                          <FormLabel>Website Url</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full border p-2 rounded-md"
                          />
                        </FormControl>
                        <FormDescription>
                          This website will be linked on the back of the card.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.barcode_encoding?.message && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.barcode_encoding?.message}
                    </p>
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
            {step < 2 && (
              <Button
                type="button"
                disabled={!watched?.logo_url || !watched?.strip_image}
                onClick={nextStep}
                className="w-24"
              >
                Next
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" className="w-24" disabled={loading}>
                {loading ? "Creating..." : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </Form>
      {/* 🔍 Live Preview */}
      <Pass pass={watched as ApplePass} />
    </div>
  );
}

/**
 * processImage
 * - img: loaded HTMLImageElement
 * - file: original File
 * - name: base filename without extension
 * - mime: target mime (always "image/png")
 * - cfg: {
 *    height: number,
 *    idealWidth?: number,
 *    width?: number,        // for thumbnails: fixed square
 *    enforceSquare: boolean,
 *    minRatio?: number,     // for thumbnails
 *    maxRatio?: number      // for thumbnails
 * }
 */
async function processImage(
  img: HTMLImageElement,
  file: File,
  name: string,
  mime: string,
  cfg: {
    height: number;
    idealWidth?: number;
    width?: number;
    enforceSquare: boolean;
    minRatio?: number;
    maxRatio?: number;
    padding?: number;
    quality?: number;
  },
): Promise<File> {
  const { height, idealWidth, enforceSquare, minRatio, maxRatio } = cfg;
  let width =
    cfg.width ??
    Math.min(
      Math.round((img.width / img.height) * height),
      idealWidth || Infinity,
    );

  // Aspect ratio validation
  const isThumbnail = !!cfg.width; // If width is specified, it's a thumbnail
  const ratio = img.width / img.height;
  
  if (isThumbnail && enforceSquare && minRatio != null && maxRatio != null) {
    // Only enforce aspect ratio for thumbnails
    if (ratio < minRatio || ratio > maxRatio) {
      throw new Error(
        `Thumbnail image aspect ratio ${ratio.toFixed(2)} is out of allowed range (${minRatio.toFixed(2)}-${maxRatio.toFixed(2)}).`,
      );
    }
    width = height; // force square for thumbnails
  } else if (isThumbnail) {
    // For thumbnails without strict ratio, ensure it's square
    width = height;
  }

  // Set up canvas with high quality settings
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { 
    alpha: true,
    willReadFrequently: true,
    colorSpace: 'display-p3', // Better color support
    desynchronized: true // Better performance for large images
  })!;
  
  // High quality rendering settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Use a higher resolution for better quality
  const scale = window.devicePixelRatio || 1;
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(scale, scale);

  // High quality downsampling with better interpolation
  const downsample = (source: HTMLCanvasElement) => {
    // Create a temporary canvas for the downsampling
    const tmp = document.createElement("canvas");
    const tctx = tmp.getContext("2d", { 
      alpha: true,
      willReadFrequently: true,
      colorSpace: 'display-p3'
    })!;
    
    // Start with original dimensions
    let cw = source.width;
    let ch = source.height;
    
    // Set initial size
    tmp.width = cw;
    tmp.height = ch;
    
    // Draw source to temp canvas
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = "high";
    tctx.drawImage(source, 0, 0);
    
    // Calculate target size with scale
    const targetWidth = width * (window.devicePixelRatio || 1);
    const targetHeight = height * (window.devicePixelRatio || 1);
    
    // Use a more gradual downsampling approach
    while (cw > targetWidth * 2 || ch > targetHeight * 2) {
      // Calculate next size (no more than 2/3 reduction at a time)
      cw = Math.max(targetWidth, Math.floor(cw * 0.66));
      ch = Math.max(targetHeight, Math.floor(ch * 0.66));
      
      // Create a step canvas
      const step = document.createElement("canvas");
      step.width = cw;
      step.height = ch;
      const sctx = step.getContext("2d", { 
        alpha: true,
        willReadFrequently: true,
        colorSpace: 'display-p3'
      })!;
      
      // High quality scaling
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(tmp, 0, 0, cw, ch);
      
      // Update temp canvas
      tmp.width = cw;
      tmp.height = ch;
      tctx.clearRect(0, 0, cw, ch);
      tctx.drawImage(step, 0, 0, cw, ch);
    }
    
    return tmp;
  };

  let sourceCanvas: HTMLCanvasElement;
  if (img.width > width * 2) {
    // start from an offscreen canvas
    const off = document.createElement("canvas");
    off.width = img.width;
    off.height = img.height;
    off.getContext("2d")!.drawImage(img, 0, 0);
    sourceCanvas = downsample(off);
  } else {
    sourceCanvas = downsample(
      Object.assign(document.createElement("canvas"), {
        width: img.width,
        height: img.height,
        getContext: () => img.getContext,
      }),
    );
  }

  // For strip images, ensure exact dimensions are met
  if (!isThumbnail) {
    // Clear the canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate aspect ratio of source and target
    const sourceAspect = sourceCanvas.width / sourceCanvas.height;
    const targetAspect = width / height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (sourceAspect > targetAspect) {
      // Source is wider than target, fit to height
      drawHeight = height;
      drawWidth = height * sourceAspect;
      offsetX = (width - drawWidth) / 2; // Center horizontally
    } else {
      // Source is taller than target, fit to width
      drawWidth = width;
      drawHeight = width / sourceAspect;
      offsetY = (height - drawHeight) / 2; // Center vertically
    }
    
    // Draw the image centered and scaled to fit
    ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    // For thumbnails, use the original behavior
    ctx.drawImage(sourceCanvas, 0, 0, width, height);
  }

  // to PNG blob with configurable quality
  const quality = cfg.quality ?? 1.0;
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, mime, quality));
  if (!blob) throw new Error("Canvas toBlob failed");

  return new File([blob], `${name}.png`, {
    type: mime,
    lastModified: Date.now(),
  });
}
