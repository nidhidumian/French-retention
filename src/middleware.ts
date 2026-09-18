import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
} from "next/server";
import { clerkConfigured } from "@/services/clerkConfig";

/** Routes a signed-out visitor may see. Everything else needs a session. */
const PUBLIC_PATHS = ["/welcome", "/sign-in", "/sign-up", "/terms", "/privacy"];

/** Auth screens a signed-in user has no business on — send them to the app. */
const AUTH_PATHS = ["/welcome", "/sign-in", "/sign-up"];

function matches(pathname: string, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Built lazily so a deployment without Clerk keys never evaluates Clerk code.
let withClerk: NextMiddleware | null = null;

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!clerkConfigured()) {
    // No keys yet — let requests through; pages render a setup notice.
    return NextResponse.next();
  }

  withClerk ??= clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();
    const { pathname } = request.nextUrl;

    if (!userId && !matches(pathname, PUBLIC_PATHS)) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
    if (userId && matches(pathname, AUTH_PATHS)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  });

  return withClerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
