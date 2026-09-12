import { NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/authMiddleware";
import { roleMiddleware } from "@/middleware/roleMiddleware";

export function proxy(request) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  const isWebhookPath = path === "/api/payments/webhook";
  if (isWebhookPath) {
    return NextResponse.next();
  }

  // 1. Page Routes Exemption (Client-side handles localStorage auth)
  if (!path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. Public API Routes Exemption
  const isEventsPath = path === "/api/events" || path.startsWith("/api/events/");
  const isRegistrationsSubPath = path.includes("/registrations");
  const isPublicEventGet = isEventsPath && method === "GET" && !isRegistrationsSubPath;

  if (isPublicEventGet) {
    return NextResponse.next();
  }

  // 3. API Authentication
  const user = authMiddleware(request);

  if (!user || user instanceof NextResponse) {
    return (
      user ||
      NextResponse.json(
        { success: false, message: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      )
    );
  }

  // 4. API Authorization Rules
  if (isEventsPath) {
    // 🟢 CHANGED: Allow standard 'user' along with 'organizer' and 'admin' for POST (Creating Events)
    if (method === "POST") {
      const roleError = roleMiddleware(user, ["user", "organizer", "admin"]);
      if (roleError) return roleError;
    }

    // PUT, PATCH, DELETE remain restricted to organizers and admins
    if (["PUT", "PATCH", "DELETE"].includes(method)) {
      const roleError = roleMiddleware(user, ["organizer", "admin"]);
      if (roleError) return roleError;
    }

    if (method === "GET" && isRegistrationsSubPath) {
      const roleError = roleMiddleware(user, ["organizer", "admin"]);
      if (roleError) return roleError;
    }
  }

  if (path === "/api/registrations" || path.startsWith("/api/registrations/")) {
    const roleError = roleMiddleware(user, ["user", "organizer", "admin"]);
    if (roleError) return roleError;
  }

  if (
    path === "/api/organizer/dashboard" ||
    path.startsWith("/api/organizer/dashboard/")
  ) {
    const roleError = roleMiddleware(user, ["organizer", "admin"]);
    if (roleError) return roleError;
  }

  // 5. Header Enrichment
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.userId || user.id || user._id);
  requestHeaders.set("x-user-role", user.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/organizer/:path*",
    "/dashboard/organizer/:path*",
    "/api/events/:path*",
    "/api/registrations/:path*",
    "/api/organizer/dashboard/:path*",
    "/api/payments/:path*",
  ],
};