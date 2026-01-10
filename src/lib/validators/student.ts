import { z } from "zod";
import { StudentStatus } from "@/lib/db/models/Student";

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
    admissionNumber: z.string().min(1, "Admission number is required"),
    rollNumber: z.string().optional(),
    dob: z.coerce.date(),
    gender: z.enum(["Male", "Female", "Other"]),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),
    class: z.string().min(1, "Class is required"),
    section: z.string().optional(),
    house: z.string().optional(),
    category: z.string().optional(),
    status: z.nativeEnum(StudentStatus).optional(),
});

export const studentUpdateSchema = studentSchema.partial();
