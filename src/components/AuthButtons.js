"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

export default function AuthButtons({ session, className = "" }) {
  if (!session) {
    return (
      <div className={["flex items-center gap-2", className].join(" ").trim()}>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-blue-50"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className={["flex items-center gap-2", className].join(" ").trim()}>
      <Link
        href="/dashboard"
        className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-blue-50"
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-blue-50"
      >
        Logout
      </button>
    </div>
  );
}

