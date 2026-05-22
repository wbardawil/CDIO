// Next 16 renamed the `middleware` file convention to `proxy`. Clerk v7.0.7
// detects `src/proxy.ts` on Next 16 (see @clerk/nextjs middleware-location).
//
// Everything is auth-gated except the landing page, the Clerk sign-in/up
// pages, and the legal pages. Cockpit routes and API also re-check auth()
// server-side — proxy is the first gate, not the only one.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/ai-disclaimer",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on every route except Next internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API routes.
    "/(api|trpc)(.*)",
  ],
};
