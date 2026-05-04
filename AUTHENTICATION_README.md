# Authentication Flow in Vibe Code Editor

This document provides a beginner-friendly overview of how authentication is implemented in this project using **NextAuth.js** (also known as Auth.js), **Prisma**, and **Next.js App Router**.

We are using OAuth providers (Google and GitHub) to let users sign in easily without needing to manage passwords.

## 1. The Configuration Files

### `auth.config.ts`

This is a lightweight configuration file that defines our authentication providers:

- **Google** and **GitHub**.
- It tells NextAuth what credentials to use (Client ID and Secret) to talk to these providers.
- _Why separate it?_ It is separated from the main database logic so that it can be imported into Next.js middleware, which is executed on the edge (and edge environments don't support some database drivers like Prisma directly).

### `auth.ts`

This is the heart of our authentication logic. It combines `auth.config.ts` with our database logic:

- **PrismaAdapter**: Connects NextAuth to our PostgreSQL database (via Prisma) to automatically save user details when they sign in.
- **Callbacks**: We hook into NextAuth's lifecycle here:
  - `signIn`: Custom logic to manage linking an OAuth account to a new or existing user in the database.
  - `jwt`: Adds custom fields (like user ID and role) to the JSON Web Token.
  - `session`: Extracts those custom fields from the token and exposes them to the client-side session object.

## 2. API Routes

### `app/api/auth/[...nextauth]/route.ts`

This file is a "Catch-all Route" created for Next.js App Router.

- NextAuth automatically handles routes like `/api/auth/signin`, `/api/auth/signout`, and callbacks from Google/GitHub under the hood using the `GET` and `POST` handlers exported here.

## 3. Middleware for Protection

### `middleware.ts`

The middleware acts as a gatekeeper. It runs _before_ every single request.

- It checks if the user is authenticated (via session cookies).
- **Public Routes**: If a route is defined in `publicRoutes` (in `routes.ts`), anyone can visit it.
- **Auth Routes**: Pages like `/auth/sign-in`. If a logged-in user tries to visit them, they get redirected away (usually to `/`).
- **Protected Routes**: If a user is not logged-in and tries to access a protected page, they are redirected to the sign-in page.

## 4. UI and User Interaction

### Signing In (`features/auth/components/signin-form-client.tsx`)

This is the login page.

- We use **Server Actions** (`"use server"`) to handle form submissions for Google and GitHub.
- Calling `signIn("google")` or `signIn("github")` redirects the user to the respective provider's consent page.

### User Button & Logging Out (`features/auth/components/user-button.tsx` & `logout-button.tsx`)

- The `UserButton` component shows the logged-in user's avatar and email.
- The `LogoutButton` triggers the `signOut()` function from NextAuth and refreshes the page to update the UI.

## 5. Fetching the Current User

We provide simple helpers to get the currently logged-in user:

- **Client Components**: Use the custom hook `useCurrentUser()` (located in `features/auth/hooks/use-current-user.ts`), which wraps `useSession()`.
- **Server Components & Actions**: Use the `currentUser()` function (located in `features/auth/actions/index.ts`), which calls `auth()` directly.

## Summary of the Flow:

1. User clicks "Sign in with Google".
2. Server Action triggers `signIn("google")`.
3. User logs in on Google's website and is redirected back to `/api/auth/callback/google`.
4. NextAuth handles the callback, checks the `signIn` callback in `auth.ts`, and saves the user in the database via Prisma.
5. NextAuth generates a JWT containing user info, sends a session cookie to the browser, and redirects the user to the home page.
6. The `middleware.ts` now allows the user to access protected routes.
