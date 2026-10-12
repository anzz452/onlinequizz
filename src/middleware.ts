import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const COOKIE_NAME = "quiz_session";
const SECRET_KEY = process.env.JWT_SECRET || "online-quiz-platform-secret-key-change-this-in-production-min-32-chars";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

interface SessionData {
  userId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

async function verifyTokenEdge(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
      isActive: Boolean(payload.isActive),
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyTokenEdge(token) : null;

  // Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session || !session.isActive) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // Protect Teacher routes
  if (pathname.startsWith("/teacher")) {
    if (!session || !session.isActive) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    if (session.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // Protect Student routes
  if (pathname.startsWith("/student")) {
    if (!session || !session.isActive) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    if (session.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from /login and /register
  if ((pathname === "/login" || pathname === "/register") && session && session.isActive) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (session.role === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    } else if (session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
    "/register",
  ],
};

