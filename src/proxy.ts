import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes: stakeholder token flow (clients don't have Clerk accounts),
// anonymous discovery funnels (chat, scan), and Clerk's own pages.
// /onboarding is NOT public — it creates a client owned by the signed-in
// practitioner, so the practitioner must be authenticated first.
const isPublicRoute = createRouteMatcher([
  "/",
  "/scan(.*)",
  "/chat(.*)",
  "/assess/:token",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/chat",
  "/api/stakeholders/by-token/:token",
  "/api/assessments",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
