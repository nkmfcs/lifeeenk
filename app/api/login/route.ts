import { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  createSessionToken,
  safeEqual,
} from "@/lib/session";
import { redirectTo } from "@/lib/redirect";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!expected || !secret || !safeEqual(password, expected)) {
    return redirectTo("/login?error=1");
  }

  const res = redirectTo("/");
  res.cookies.set(SESSION_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return res;
}
