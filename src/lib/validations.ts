// src/lib/validations.ts
import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(1, { message: "Project title is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  technologies: z.array(z.string()).optional(),
  url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export const workExperienceSchema = z.object({
  company: z.string().min(1, { message: "Company name is required." }),
  position: z.string().min(1, { message: "Position is required." }),
  duration: z.string().optional(),
  description: z.string().optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(1, { message: "Certification name is required." }),
  issuer: z.string().min(1, { message: "Issuing organization is required." }),
  date: z.string().optional(),
});