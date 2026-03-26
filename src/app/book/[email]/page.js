import Image from "next/image";

import Navbar from "../../../components/Navbar";
import BookingCalendar from "../../../components/BookingCalendar";

import connectMongo from "../../../../lib/mongodb";
import User from "../../../../models/User";

export default async function BookingPage({ params }) {
  const resolvedParams = await params;
  const decodedEmail = decodeURIComponent(resolvedParams?.email ?? "");

  await connectMongo();
  const user = await User.findOne({ email: decodedEmail }).lean();

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl px-6 py-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">
              User not found
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              We couldn't find a host with that email address.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Strip Mongoose document fields before passing to a client component.
  const availability = JSON.parse(JSON.stringify(user.availability));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Book with {user.name || "host"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">{user.email}</p>
          </div>

          <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white border border-gray-200">
            {user.image ? (
              <Image
                src={user.image}
                alt="Host profile picture"
                fill
                className="object-cover"
                sizes="56px"
                priority
              />
            ) : null}
          </div>
        </div>

        <BookingCalendar availability={availability} />
      </main>
    </div>
  );
}

