import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// This file configures the authentication providers (like Google and GitHub).
// We keep it separate from auth.ts so it can be used in Next.js middleware, 
// which doesn't support some features like the Prisma database adapter yet.
export default{
    providers:[
        // Configure GitHub authentication
        GitHub({
            clientId:process.env.AUTH_GITHUB_ID,
            clientSecret:process.env.AUTH_GITHUB_SECRET
        }),
        // Configure Google authentication
        Google({
            clientId:process.env.AUTH_GOOGLE_ID,
            clientSecret:process.env.AUTH_GOOGLE_SECRET,
        })
    ]
} satisfies NextAuthConfig