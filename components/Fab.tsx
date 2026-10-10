"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SHOW_ON = ["/", "/journal", "/finance"];

export default function Fab() {
  const pathname = usePathname();
  if (!SHOW_ON.includes(pathname)) return null;

  return (
    <Link href="/new-expense" className="fab" aria-label="Новый расход">
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
