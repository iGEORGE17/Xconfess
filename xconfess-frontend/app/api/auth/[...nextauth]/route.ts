<<<<<<< HEAD
/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * ⚠️  NextAuth is NOT used in this project.
 *
 * xConfess uses a custom JWT authentication strategy:
 *   - Tokens are issued by the NestJS backend (POST /auth/login)
 *   - Token storage and validation: see xconfess-frontend/app/lib/api/auth.ts
 *
 * This file exists only to prevent Next.js from throwing errors on
 * /api/auth/* requests that may be triggered by browser extensions
 * or misconfigured clients. It returns a 501 with a message.
 *
 * If NextAuth is adopted in the future, replace this file with:
 *   import NextAuth from "next-auth";
 *   const handler = NextAuth({ ... });
 *   export { handler as GET, handler as POST };
 */

import { NextResponse } from "next/server";

/**
 * Handles any GET or POST request to /api/auth/*.
 * Returns 501 Not Implemented — the route exists but NextAuth is not configured.
 */
function handler() {
  return NextResponse.json(
    {
      error: "Not Implemented",
      message:
        "xConfess uses custom JWT authentication via the NestJS backend. " +
        "See /app/lib/api/auth.ts for the active auth utilities.",
    },
=======
import { NextResponse } from 'next/server';

// NOTE: This project uses a custom JWT flow stored in localStorage.
// This route exists only to satisfy Next.js routing/build expectations.
// If you want NextAuth, replace this stub with a real NextAuth handler.

export async function GET() {
  return NextResponse.json(
    { error: 'NextAuth is not configured for this app.' },
>>>>>>> origin/main
    { status: 501 },
  );
}

<<<<<<< HEAD
export { handler as GET, handler as POST };
=======
export async function POST() {
  return NextResponse.json(
    { error: 'NextAuth is not configured for this app.' },
    { status: 501 },
  );
}
>>>>>>> origin/main
