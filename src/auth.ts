import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
    identifier: z.string().min(3), // Email or Phone
    password: z.string().min(6),
    loginType: z.enum(["SUPERADMIN", "SCHOOL", "PORTAL"]).optional(),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                identifier: { label: "Email or Phone", type: "text" },
                password: { label: "Password", type: "password" },
                loginType: { type: "hidden" },
            },
            authorize: async (credentials) => {
                const { identifier, password, loginType } = await loginSchema.parseAsync(credentials);
                console.log('Login attempt', { identifier, loginType });
                await connectDB();

                // Find user by email OR phone
                const user = await User.findOne({
                    $or: [
                        { email: identifier },
                        { phone: identifier }
                    ]
                });

                if (!user) {
                    console.error('Login failed: user not found', identifier);
                    throw new Error("Invalid credentials.");
                }
                if (!user.isActive) {
                    console.error('Login failed: user disabled', identifier);
                    throw new Error("User account is disabled.");
                }

                // --- Role-Based Portal Blocking ---
                const role = user.role.toUpperCase();
                if (loginType === "PORTAL") {
                    if (role !== "STUDENT" && role !== "PARENT") {
                        throw new Error("Please use School Login");
                    }
                } else if (loginType === "SUPERADMIN") {
                    if (role !== "SUPER_ADMIN") {
                        throw new Error("Unauthorized access.");
                    }
                } else if (loginType === "SCHOOL") {
                    const staffRoles = ["SCHOOL_ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "TRANSPORT_MANAGER", "STAFF"];
                    if (!staffRoles.includes(role)) {
                        if (role === "STUDENT" || role === "PARENT") {
                            throw new Error("Please use Student Portal Login");
                        }
                        throw new Error("Unauthorized access.");
                    }
                }

                const storedHash = user.passwordHash || "";
                const isValid = await bcrypt.compare(password, storedHash);

                if (!isValid) {
                    console.error('Login failed: invalid password', identifier);
                    throw new Error("Invalid credentials.");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    schoolId: user.school?.toString(),
                    linkedStudentId: user.linkedStudentId?.toString(),
                };
            }
        })
    ]
});
