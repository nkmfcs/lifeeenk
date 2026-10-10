import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  createSessionToken,
  safeEqual,
} from "@/lib/session";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  const url = req.nextUrl.clone();
  url.search = "";

  if (!expected || !secret || !safeEqual(password, expected)) {
    url.pathname = "/login";
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 303);
  }

  url.pathname = "/";
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(SESSION_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return res;
}
