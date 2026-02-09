import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const auth = NextAuth(authConfig).auth;
export { auth as proxy };
export default auth;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
