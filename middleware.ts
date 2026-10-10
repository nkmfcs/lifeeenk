import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.AUTH_SECRET);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Всё, кроме страницы входа, API входа/выхода и служебных файлов
  matcher: [
    "/((?!login|api/login|api/logout|_next/static|_next/image|icon.svg|manifest.webmanifest|favicon.ico).*)",
  ],
};
