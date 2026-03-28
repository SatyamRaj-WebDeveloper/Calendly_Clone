import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../app/api/auth/[...nextauth]/route"; 
import AuthButtons from "./AuthButtons";
import MobileNav from "./MobileNav";

export default async function Navbar() {

  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900"
          aria-label="Go to homepage"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            4N
          </span>
          <span>Scheduling</span>
        </Link>

        <nav className="hidden items-center gap-3 sm:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-blue-50"
          >
            Home
          </Link>
          <AuthButtons session={session} />
        </nav>

        <MobileNav session={session} />
      </div>
    </header>
  );
}