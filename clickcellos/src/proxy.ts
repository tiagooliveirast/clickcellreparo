import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/login", "/logout"]
const publicSlugPattern = /^\/([a-z0-9-]+)(?:\/solicitar-coleta|\/rastrear)?$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = publicPaths.includes(pathname) || publicSlugPattern.test(pathname)
  const isApiAuth = pathname.startsWith("/api/auth") || pathname === "/api/auth/signin"

  if (isPublicPath || isApiAuth) {
    return NextResponse.next()
  }

  const token = request.cookies.get("next-auth.session-token")?.value
    || request.cookies.get("__Secure-next-auth.session-token")?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
}
