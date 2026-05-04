"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Fetches a user from the database by their ID.
 * It also includes their linked OAuth accounts (like Google or GitHub).
 */
export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: { accounts: true },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * Fetches an account (OAuth connection) by the user's ID.
 */
export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await db.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * A helper function to quickly get the currently logged-in user 
 * on the server-side using NextAuth.
 */
export const currentUser = async () => {
  // auth() retrieves the current session
  const user = await auth();
  // Return just the user object from the session
  return user?.user;
};
