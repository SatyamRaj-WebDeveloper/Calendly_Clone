import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import connectMongo from "../../../../lib/mongodb";
import User from "../../../../models/User";

import { authOptions } from "../auth/[...nextauth]/route";

function normalizeAvailability(input) {
  if (!Array.isArray(input)) return null;

  const normalized = [];
  for (const item of input) {
    const dayOfWeek = Number(item?.dayOfWeek);
    const startTime = item?.startTime;
    const endTime = item?.endTime;

    if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) continue;
    if (typeof startTime !== "string" || typeof endTime !== "string") continue;

    normalized.push({ dayOfWeek, startTime, endTime });
  }

  return normalized;
}

/** Validate IANA timezone; fall back to UTC if invalid. */
function normalizeTimeZone(input) {
  if (typeof input !== "string") return "UTC";
  const tz = input.trim();
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const availabilityInput = body?.availability;
  const availability = normalizeAvailability(availabilityInput);
  if (!availability) {
    return NextResponse.json(
      { error: "Invalid availability payload" },
      { status: 400 },
    );
  }

  const timeZone = normalizeTimeZone(body?.timeZone);

  await connectMongo();

  const updated = await User.findOneAndUpdate(
    { email },
    { $set: { availability, timeZone } },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      message: "Availability updated",
      availability: updated.availability,
      timeZone: updated.timeZone,
    },
    { status: 200 },
  );
}

