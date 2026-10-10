import { NextResponse } from "next/server";

// Относительный редирект: не зависит от внутреннего адреса за прокси (Railway).
export function redirectTo(path: string, status: 303 | 307 = 303): NextResponse {
  return new NextResponse(null, { status, headers: { Location: path } });
}
