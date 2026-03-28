import { z } from "zod";

export const MaterialSchema = z.object({
  category: z.enum([
    "plants",
    "hard_landscaping",
    "soil_amendments",
    "irrigation",
    "structures",
    "tools_equipment",
    "other",
  ]),
  item: z.string(),
  quantity: z.string(),
  estimatedUnitCost: z.string(),
  estimatedTotalCost: z.string(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

export const PhaseSchema = z.object({
  phaseName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["pending", "in_progress", "complete"]),
  notes: z.string().optional(),
});

export const ScheduleSchema = z.object({
  scheduledStartDate: z.string().optional(),
  scheduledEndDate: z.string().optional(),
  estimatedDurationDays: z.number().optional(),
  assignedTo: z.array(z.string()).optional(),
  phases: z.array(PhaseSchema).optional(),
});

export const GardenDesignSchema = z.object({
  title: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  estimatedCost: z.string(),
  materials: z.array(MaterialSchema).min(5),
  birdsEyePrompt: z.string(),
});

export const QuoteSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  propertyAddress: z.string(),
  postcode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(["draft", "sent", "accepted", "declined", "scheduled"]),
  photos: z.array(z.string()), // base64 or URLs
  satelliteImageUrl: z.string().optional(),
  notes: z.string().optional(),
  designs: z.array(GardenDesignSchema).length(3),
  selectedDesign: z.number().nullable(),
  birdsEyeImageUrls: z.array(z.string()).optional(),
  totalEstimatedCost: z.string(),
  scheduledDate: z.string().nullable(),
  completionDate: z.string().nullable(),
  tags: z.array(z.string()),
  schedule: ScheduleSchema.optional(),
});

export type Material = z.infer<typeof MaterialSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type GardenDesign = z.infer<typeof GardenDesignSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
