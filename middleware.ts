import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.AUTH_SECRET);
  if (ok) return NextResponse.next();

  // За прокси (Railway) внутренний адрес — localhost:8080, поэтому берём
  // настоящий хост и протокол из заголовков прокси.
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0] ??
    (host.startsWith("localhost") ? "http" : "https");

  return NextResponse.redirect(new URL("/login", `${proto}://${host}`), 307);
}

export const config = {
  // Всё, кроме страницы входа, API входа/выхода и служебных файлов
  matcher: [
    "/((?!login|api/login|api/logout|_next/static|_next/image|icon.svg|manifest.webmanifest|favicon.ico).*)",
  ],
};
