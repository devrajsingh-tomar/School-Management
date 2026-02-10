
import type { NextAuthConfig } from "next-auth";

// This file must be edge compatible. 
// No bcrypt, no mongoose imports here.
export const authConfig = {
    providers: [], // Providers added in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = (auth?.user?.role || "").toUpperCase();
            const pathname = nextUrl.pathname;

            const isOnSuperAdmin = pathname.startsWith("/superadmin") && !pathname.includes("/login");
            const isOnPortal = pathname.startsWith("/portal") && !pathname.includes("/login");
            const isOnSchool = pathname.startsWith("/school") && !pathname.includes("/login");
            const isOnAuth = pathname.endsWith("/login") || pathname.startsWith("/register");
            const isHomePage = pathname === "/";

            if (isOnSuperAdmin || isOnPortal || isOnSchool) {
                if (isLoggedIn) {
                    // 1. Redirect if on wrong panel
                    if (isOnSuperAdmin && role !== "SUPER_ADMIN") {
                        if (role === "STUDENT") return Response.redirect(new URL("/portal/student", nextUrl));
                        if (role === "PARENT") return Response.redirect(new URL("/portal/parent", nextUrl));
                        return Response.redirect(new URL("/school", nextUrl));
                    }
                    if (isOnPortal) {
                        if (role === "STUDENT" && pathname === "/portal") return Response.redirect(new URL("/portal/student", nextUrl));
                        if (role === "PARENT" && pathname === "/portal") return Response.redirect(new URL("/portal/parent", nextUrl));
                        if (!["STUDENT", "PARENT"].includes(role || "")) {
                            return Response.redirect(new URL(role === "SUPER_ADMIN" ? "/superadmin" : "/school", nextUrl));
                        }
                    }
                    if (isOnSchool && ["STUDENT", "PARENT"].includes(role || "")) {
                        return Response.redirect(new URL(role === "STUDENT" ? "/portal/student" : "/portal/parent", nextUrl));
                    }
                    if (isOnSchool && role === "SUPER_ADMIN") {
                        return Response.redirect(new URL("/superadmin", nextUrl));
                    }

                    // 2. Granular School Permissions (same logic as before)
                    if (isOnSchool && role !== "SCHOOL_ADMIN" && role !== "SUPER_ADMIN") {
                        let allowedPrefixes: string[] = ["/school"];
                        if (role === "TEACHER" || role === "STAFF") {
                            allowedPrefixes = ["/school", "/school/students", "/school/academics", "/school/attendance", "/school/exams", "/school/timetable", "/school/communication"];
                        } else if (role === "ACCOUNTANT") {
                            allowedPrefixes = ["/school", "/school/students", "/school/finance", "/school/reports"];
                        } else if (role === "LIBRARIAN") {
                            allowedPrefixes = ["/school", "/school/library", "/school/students"];
                        } else if (role === "TRANSPORT_MANAGER") {
                            allowedPrefixes = ["/school", "/school/transport", "/school/students"];
                        }
                        const isAllowed = allowedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + "/"));
                        if (!isAllowed) return Response.redirect(new URL("/school", nextUrl));
                    }

                    return true;
                }
                return false; // Redirect to login
            } else if (isOnAuth || isHomePage) {
                if (isLoggedIn) {
                    if (role === "SUPER_ADMIN") return Response.redirect(new URL("/superadmin", nextUrl));
                    if (role === "STUDENT") return Response.redirect(new URL("/portal/student", nextUrl));
                    if (role === "PARENT") return Response.redirect(new URL("/portal/parent", nextUrl));
                    return Response.redirect(new URL("/school", nextUrl));
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.schoolId = user.schoolId;
                token.linkedStudentId = (user as any).linkedStudentId;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub as string;
                session.user.role = token.role as string;
                session.user.schoolId = token.schoolId as string | undefined;
                session.user.linkedStudentId = token.linkedStudentId as string | undefined;
            }
            return session;
        }
    },
    pages: {
        signIn: "/school/login", // Default, but we'll have multiple
    },
    session: {
        strategy: "jwt",
    },
} satisfies NextAuthConfig;
