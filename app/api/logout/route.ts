import { SESSION_COOKIE } from "@/lib/session";
import { redirectTo } from "@/lib/redirect";

export async function POST() {
  const res = redirectTo("/login");
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
