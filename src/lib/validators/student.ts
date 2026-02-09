import { z } from "zod";
import { StudentStatus } from "@/lib/types/enums";

export const guardianSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    relationship: z.string().min(1, "Relationship is required"),
    occupation: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),
});

export const studentSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    admissionNumber: z.string().optional(),
    rollNumber: z.string().optional(),
    dob: z.coerce.date(),
    gender: z.enum(["Male", "Female", "Other"]),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),
    class: z.string().min(1, "Class is required"),
    section: z.string().min(1, "Section is required"),
    house: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    status: z.nativeEnum(StudentStatus).optional(),
    createPortalAccess: z.boolean().optional(),
    loginPassword: z.string().min(6).optional(),
});

export const studentUpdateSchema = studentSchema.partial();
