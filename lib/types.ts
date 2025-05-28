import { z } from "zod";

// Full Pass schema based on the `passes` table
export const PassSchema = z.object({
  // Auto-generated
  id: z.number().int().positive(),

  // Core fields
  pass_share_id: z.string().min(1, "Pass share ID is required"),
  organization_id: z
    .number()
    .int()
    .positive("Organization ID must be a positive integer"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),

  // URLs and tokens
  file_url: z.string().url("Must be a valid URL"),
  authentication_token: z.string().min(1, "Authentication token is required"),
  slug: z.string().min(1, "Slug is required"),
  serial_number: z.string().min(1, "Serial number is required"),
  user_id: z.string().min(1, "User ID is required"),

  // Optional visual fields
  logo_text: z.string().optional(),
  background_color: z.string().optional(),
  text_color: z.string().optional(),

  // Optional images
  logo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  strip_image: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  // Optional pass-specific fields
  secondary_left_label: z.string().optional(),
  secondary_left_value: z.string().optional(),
  secondary_right_label: z.string().optional(),
  secondary_right_value: z.string().optional(),

  barcode_value: z.string().optional(),
  barcode_format: z.string().optional(),

  website_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  header_field_label: z.string().optional(),
  header_field_value: z.string().optional(),

  // Timestamps
  created_at: z.date(),
  updated_at: z.date(),
});

// TypeScript types
export type ApplePass = z.infer<typeof PassSchema>;

// Schema for creating a new pass (omit auto-generated fields)
export const CreatePassSchema = PassSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type CreatePass = z.infer<typeof CreatePassSchema>;

// Schema for updating an existing pass (all fields optional, except id)
export const UpdatePassSchema = PassSchema.omit({
  created_at: true,
  updated_at: true,
})
  .partial()
  .refine((data) => data.id !== undefined, {
    message: "ID is required for update",
  });
export type UpdatePass = z.infer<typeof UpdatePassSchema>;
