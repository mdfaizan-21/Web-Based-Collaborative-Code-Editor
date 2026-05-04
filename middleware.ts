import NextAuth from "next-auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
} from "@/routes";
import authConfig from "./auth.config";

// Initialize NextAuth with just the providers config for middleware compatibility
const { auth } = NextAuth(authConfig);

// The middleware is a function that runs before every request to your app.
// We use it to protect routes and redirect unauthenticated users.
// @ts-ignore
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // Check if the user has an active session

  // Determine the type of the current route being accessed
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // 1. Always allow API authentication routes (like /api/auth/signin)
  if (isApiAuthRoute) {
    return null; // Proceed without doing anything
  }

  // 2. If the user is on an authentication page (like login or register)
  if (isAuthRoute) {
    // If they are already logged in, redirect them away to the default page (e.g. Home)
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null; // Otherwise, let them access the auth page
  }

  // 3. For all other routes, if the user is not logged in and it's not a public route
  if (!isLoggedIn && !isPublicRoute) {
    // Redirect them to the sign-in page to log in
    return Response.redirect(new URL("/auth/sign-in", nextUrl));
  }

  // Allow the request to proceed normally for all other cases
  return null;
});

// Configure which URL paths the middleware should run on
export const config = {
  // This regular expression matches all routes except for static files and Next.js internals
  // copied from clerk
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
