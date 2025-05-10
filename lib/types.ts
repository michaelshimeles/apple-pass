import { z } from "zod";

export const PassSchema = z.object({
  id: z.number().optional(), // Optional for creation, auto-generated
  
  name: z.string().nonempty("Name is required"),
  description: z.string().nonempty("Description is required"),
  
  fileUrl: z.string().url("Must be a valid URL"),
  authenticationToken: z.string().nonempty("Authentication token is required"),
  slug: z.string().nonempty("Slug is required"),
  serialNumber: z.string().nonempty("Serial number is required"),
  
  userId: z.string().nonempty("User ID is required"),
  
  // Custom visual fields (optional)
  logoText: z.string().optional(),
  backgroundColor: z.string().optional(),
  
  // Images (optional)
  logoUrl: z.string().url("Must be a valid URL").optional(),
  stripImageFrontUrl: z.string().url("Must be a valid URL").optional(),
  stripImageBackUrl: z.string().url("Must be a valid URL").optional(),
  thumbnailUrl: z.string().url("Must be a valid URL").optional(),
  backgroundUrl: z.string().url("Must be a valid URL").optional(),
  
  // Pass fields (optional)
  primaryFieldLabel: z.string().optional(),
  primaryFieldValue: z.string().optional(),
  secondaryFieldLabel: z.string().optional(),
  secondaryFieldValue: z.string().optional(),
  auxiliaryFieldLabel: z.string().optional(),
  auxiliaryFieldValue: z.string().optional(),
  
  // Barcode and links (optional)
  barcodeValue: z.string().optional(),
  barcodeFormat: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional(),
  headerFieldLabel: z.string().optional(),
  headerFieldValue: z.string().optional(),
  
  // Timestamps
  createdAt: z.date().optional(), // Optional for creation, auto-generated
  updatedAt: z.date().optional(), // Optional for creation, auto-generated
});

// Type definition derived from the schema
export type ApplePass = z.infer<typeof PassSchema>;

// Schema for creating a new pass (without id and timestamps)
export const CreatePassSchema = PassSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type CreatePass = z.infer<typeof CreatePassSchema>;

// Schema for updating an existing pass
export const UpdatePassSchema = PassSchema.partial().omit({ 
  id: true 
});

export type UpdatePass = z.infer<typeof UpdatePassSchema>;