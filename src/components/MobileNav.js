"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import AuthButtons from "./AuthButtons";

export default function MobileNav({ session }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-blue-50"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-gray-900/20"
            onClick={() => setOpen(false)}
          />

          <div
            id={panelId}
            className="absolute right-4 top-4 w-[min(92vw,22rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-blue-50"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-blue-50"
              >
                Dashboard
              </Link>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <AuthButtons session={session} className="w-full flex-col items-stretch" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

