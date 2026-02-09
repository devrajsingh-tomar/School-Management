import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string;
            role: string;
            schoolId?: string;
            phone?: string;
            linkedStudentId?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        schoolId?: string;
        phone?: string;
        linkedStudentId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        schoolId?: string;
        phone?: string;
        linkedStudentId?: string;
    }
}
