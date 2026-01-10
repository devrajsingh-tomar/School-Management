import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const { email, password } = await loginSchema.parseAsync(credentials);
                console.log('Login attempt', { email });
                await connectDB();
                const user = await User.findOne({ email });
                if (!user) {
                    console.error('Login failed: user not found', email);
                    throw new Error("Invalid credentials.");
                }
                if (!user.isActive) {
                    console.error('Login failed: user disabled', email);
                    throw new Error("User account is disabled.");
                }
                const storedHash = user.passwordHash || "";
                console.log('Comparing password hash length', storedHash.length);
                const isValid = await bcrypt.compare(password, storedHash);
                console.log('Password compare result', { isValid, email });
                if (!isValid) {
                    console.error('Login failed: invalid password', email);
                    throw new Error("Invalid credentials.");
                }
                console.log('Login successful', { email, userId: user._id.toString() });
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    schoolId: user.school?.toString(),
                };
            }
        })
    ]
});
