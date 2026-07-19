import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const DASHBOARD_ROUTES = [
  "/master", "/tecnico", "/franqueado", "/motoboy",
  "/unidades", "/financeiro", "/equipe", "/clientes", "/ai",
  "/ordens",
]
const PUBLIC_PATHS = ["/login", "/logout", "/_not-found"]
const PUBLIC_PREFIXES = ["/api/auth"]

const PUBLIC_SLUG_PATTERN = /^\/([a-z0-9-]+)(?:\/(solicitar-coleta|rastrear))?$/

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )
}

function isPublicSlugRoute(pathname: string): boolean {
  return PUBLIC_SLUG_PATTERN.test(pathname) && !isDashboardRoute(pathname)
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  if (isPublicSlugRoute(pathname)) return true
  return false
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies
      .getAll()
      .some(
        (c) =>
          c.name.startsWith("__Secure-authjs.session-token.") ||
          c.name.startsWith("authjs.session-token.")
      )

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
