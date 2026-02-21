/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * ? NextAuth is NOT used in this project.
 *
 * xConfess uses a custom JWT authentication strategy:
 *   - Tokens are issued by the NestJS backend (POST /auth/login)
 *   - Token storage and validation: see xconfess-frontend/app/lib/api/auth.ts
 *
 * This file exists only to prevent Next.js from throwing a 404 on
 * /api/auth/* requests that may be triggered by browser extensions
 * or misconfigured clients. It returns a clear 404 with a message.
 *
 * If NextAuth is adopted in the future, replace this file with:
 *   import NextAuth from "next-auth";
 *   const handler = NextAuth({ ... });
 *   export { handler as GET, handler as POST };
 */

import { NextResponse } from "next/server";

/**
 * Handles any GET or POST request to /api/auth/*.
 * Returns a 404 with a message explaining the active auth strategy.
 */
function handler() {
  return NextResponse.json(
    {
      error: "NextAuth is not configured for this project.",
      message:
        "xConfess uses custom JWT authentication via the NestJS backend. " +
        "See /app/lib/api/auth.ts for the active auth utilities.",
    },
    { status: 404 },
  );
}

export { handler as GET, handler as POST };
