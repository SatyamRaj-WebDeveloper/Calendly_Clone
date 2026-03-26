import Navbar from "../components/Navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
        <section aria-label="Hero" className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-10 hidden h-64 w-64 rounded-full bg-blue-200/40 blur-3xl sm:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-0 hidden h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl sm:block"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/60 px-4 py-2 text-sm text-blue-700">
                <span className="inline-flex h-2 w-2 rounded-full bg-blue-600" />
                Fast scheduling for teams and individuals
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Scheduling made simple
              </h1>

              <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
                Share your availability, let clients pick a time, and keep every meeting on track.
                Built to reduce back-and-forth and make scheduling feel effortless.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/get-started"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                >
                  Get Started
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View Pricing
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your next availability</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">Today</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  3 slots
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {["10:00 AM - 10:30 AM", "1:00 PM - 1:30 PM", "3:30 PM - 4:00 PM"].map(
                  (slot) => (
                    <button
                      key={slot}
                      type="button"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="block text-sm font-medium text-gray-900">{slot}</span>
                      <span className="block mt-1 text-xs text-gray-500">Instant confirmation</span>
                    </button>
                  )
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Calendar sync
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Email reminders
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Smart links
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
