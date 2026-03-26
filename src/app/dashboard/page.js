import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import Navbar from "../../components/Navbar";
import AvailabilityEditor from "../../components/AvailabilityEditor";

import connectMongo from "../../../lib/mongodb";
import User from "../../../models/User";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/");
  }

  await connectMongo();
  const user = await User.findOne({ email }).lean();

  const availability = JSON.parse(JSON.stringify(user?.availability ?? []));
  const name = user?.name ?? session?.user?.name ?? "";
  const image = user?.image ?? session?.user?.image ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100">
                {image ? (
                  <Image
                    src={image}
                    alt="Profile picture"
                    fill
                    className="object-cover"
                    sizes="56px"
                    priority
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-gray-900">
                  {name || "Your account"}
                </h1>
                <p className="truncate text-sm text-gray-600">{email}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Weekly availability</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {availability.length}
                  <span className="text-sm font-medium text-gray-600"> day(s)</span>
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Weekly availability
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Toggle the days you accept meetings and edit your start/end times.
                </p>
              </div>
            </div>

            <AvailabilityEditor availability={availability} />
          </section>
        </div>
      </main>
    </div>
  );
}

