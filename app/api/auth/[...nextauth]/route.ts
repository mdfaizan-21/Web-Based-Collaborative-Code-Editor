// This file handles all the NextAuth.js API routes under /api/auth/*
// It processes authentication requests like sign-in, sign-out, and OAuth callbacks.
import { handlers } from "@/auth";

// Exporting GET and POST methods required by Next.js App Router for NextAuth to work properly
export const { GET, POST } = handlers;
