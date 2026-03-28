import { NextResponse } from "next/server";
import { google } from "googleapis";

import connectMongo from "../../../../lib/mongodb";
import User from "../../../../models/User";

function isEmail(str) {
  return typeof str === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hostEmail = body?.hostEmail;
  const guestName = body?.guestName;
  const guestEmail = body?.guestEmail;
  const topic = body?.topic ?? "";
  const startISO = body?.startISO;
  const endISO = body?.endISO;

  if (!isEmail(hostEmail)) {
    return NextResponse.json({ error: "Invalid hostEmail" }, { status: 400 });
  }
  if (typeof guestName !== "string" || !guestName.trim()) {
    return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
  }
  if (!isEmail(guestEmail)) {
    return NextResponse.json({ error: "Invalid guestEmail" }, { status: 400 });
  }
  if (typeof startISO !== "string" || typeof endISO !== "string") {
    return NextResponse.json({ error: "startISO and endISO are required" }, { status: 400 });
  }

  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Invalid start/end time" }, { status: 400 });
  }

  await connectMongo();
  const host = await User.findOne({ email: hostEmail }).lean();
  if (!host) {
    return NextResponse.json({ error: "Host not found" }, { status: 404 });
  }

  const accessToken = host?.accessToken;
  const refreshToken = host?.refreshToken;

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { error: "Host Google tokens missing. Please have the host re-login with Google." },
      { status: 400 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
      : undefined);

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Google OAuth env vars missing" },
      { status: 500 },
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const summary = `Meeting with ${guestName.trim()}`;
  const description = String(topic || "").trim();

  try {
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary,
        description: description ? description : undefined,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: [{ email: guestEmail.trim() }],
      },
      sendUpdates: "all",
    });

    return NextResponse.json(
      {
        ok: true,
        eventId: event?.data?.id || null,
        htmlLink: event?.data?.htmlLink || null,
      },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 },
    );
  }
}

