
import type { NextAuthConfig } from "next-auth";

// This file must be edge compatible. 
// No bcrypt, no mongoose imports here.
export const authConfig = {
    providers: [], // Providers added in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/school") || nextUrl.pathname.startsWith("/admin") || nextUrl.pathname === "/dashboard";
            const isOnAuth = nextUrl.pathname.startsWith("/login");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            } else if (isOnAuth) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.schoolId = user.schoolId;
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
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
} satisfies NextAuthConfig;
