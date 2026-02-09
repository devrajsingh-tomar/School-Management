import { z } from "zod";

export const staffSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    role: z.enum(["TEACHER", "ACCOUNTANT", "LIBRARIAN", "TRANSPORT_MANAGER", "STAFF"]),
    password: z.string().min(6),
    designation: z.string().min(1),
    department: z.string().min(1),
    joiningDate: z.date(),
    basicSalary: z.number(),
});

export type StaffFormData = z.infer<typeof staffSchema>;
