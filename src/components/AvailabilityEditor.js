"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function buildDayState(availability) {
  const byDay = new Map();
  for (const slot of availability || []) {
    if (typeof slot?.dayOfWeek !== "number") continue;
    byDay.set(slot.dayOfWeek, {
      startTime: slot.startTime ?? "09:00",
      endTime: slot.endTime ?? "17:00",
    });
  }

  return DAYS.map((d) => {
    const slot = byDay.get(d.value);
    return {
      ...d,
      active: Boolean(slot),
      startTime: slot?.startTime ?? "09:00",
      endTime: slot?.endTime ?? "17:00",
    };
  });
}

export default function AvailabilityEditor({ availability }) {
  const router = useRouter();
  const initialDays = useMemo(() => buildDayState(availability), [availability]);
  const [days, setDays] = useState(initialDays);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  useEffect(() => {
    // Keep UI in sync with server data after refresh.
    setDays(initialDays);
  }, [initialDays]);

  async function onSave() {
    const payloadAvailability = days
      .filter((d) => d.active)
      .map((d) => ({
        dayOfWeek: d.value,
        startTime: d.startTime,
        endTime: d.endTime,
      }));

    setStatus({ kind: "saving", message: "Saving…" });
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: payloadAvailability, timeZone }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to update availability");
      }

      setStatus({ kind: "success", message: "Saved successfully." });
      router.refresh();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err?.message || "Something went wrong while saving.",
      });
    }
  }

  function updateDay(dayValue, patch) {
    setDays((prev) =>
      prev.map((d) => (d.value === dayValue ? { ...d, ...patch } : d)),
    );
  }

  return (
    <div className="mt-4">
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-1">
          {days.map((d) => (
            <div
              key={d.value}
              className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-4 py-3 last:border-b"
            >
              <div className="flex items-center gap-2">
                <input
                  id={`day-${d.value}`}
                  type="checkbox"
                  checked={d.active}
                  onChange={(e) => updateDay(d.value, { active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label
                  htmlFor={`day-${d.value}`}
                  className="select-none text-sm font-medium text-gray-900"
                >
                  {d.label}
                </label>
              </div>

              <div className="flex flex-1 items-center gap-3 sm:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Start</span>
                  <input
                    type="time"
                    step={300}
                    value={d.startTime}
                    disabled={!d.active}
                    onChange={(e) => updateDay(d.value, { startTime: e.target.value })}
                    className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">End</span>
                  <input
                    type="time"
                    step={300}
                    value={d.endTime}
                    disabled={!d.active}
                    onChange={(e) => updateDay(d.value, { endTime: e.target.value })}
                    className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Toggle days on/off, then adjust start and end times. Times are saved in
          your current timezone (
          {Intl.DateTimeFormat().resolvedOptions().timeZone}).
        </p>
        <div className="flex items-center gap-3">
          {status.kind !== "idle" ? (
            <span
              className={
                status.kind === "success"
                  ? "text-sm font-medium text-emerald-600"
                  : status.kind === "error"
                    ? "text-sm font-medium text-red-600"
                    : "text-sm font-medium text-blue-600"
              }
            >
              {status.message}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={status.kind === "saving"}
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save availability
          </button>
        </div>
      </div>
    </div>
  );
}

