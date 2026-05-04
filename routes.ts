/**
 * An Array of routes that are accessible to the public.
 * These routes do not require authentication, meaning anyone can visit them.
 * @type {string[]}
 */
export const publicRoutes: string[] = [
   
]

/**
 * An Array of routes that are protected.
 * These routes require authentication. If a user is not logged in, they will be redirected.
 * @type {string[]}
 */
export const protectedRoutes: string[] = [
    "/",
    
]

/**
 * An Array of routes that are used for authentication (like login or signup pages).
 * If a user is already logged in and tries to visit these, they will be redirected to the default page.
 * @type {string[]}
 */
export const authRoutes: string[] = [
    "/auth/sign-in",   // Added leading slash for the sign-in page
   
]

/**
 * The prefix for API authentication routes.
 * Routes that start with this prefix are used by NextAuth to handle login/logout logic.
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth"

/**
 * The default path to redirect users to after they successfully log in.
 */
export const DEFAULT_LOGIN_REDIRECT = "/"; // Changed to redirect to home page after login