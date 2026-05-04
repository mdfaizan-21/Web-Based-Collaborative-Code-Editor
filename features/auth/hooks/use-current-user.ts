import { useSession } from "next-auth/react";

// A custom hook to easily get the currently logged-in user in client-side components
export const useCurrentUser = () => {
  // useSession hook from next-auth retrieves the active session data
  const session = useSession();

  // Return just the user object from the session if it exists, for convenience
  return session?.data?.user;
};
