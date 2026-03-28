"use client";

import { useMemo, useState } from "react";
import { DateTime } from "luxon";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatLocalTimeLabel(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}


function luxonWeekdayToJs(weekday) {
  return weekday === 7 ? 0 : weekday;
}

function parseHourMinute(timeStr) {
  const [h, m] = String(timeStr).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return { h, m };
}


function buildCrossTimezoneSlots(
  selectedDate,
  availability,
  hostTimeZone,
  guestTimeZone,
) {
  if (!selectedDate || !availability?.length) return [];

  const hostTz = hostTimeZone || "UTC";
  const guestTz = guestTimeZone || "UTC";

  const guestStart = DateTime.fromJSDate(selectedDate, {
    zone: guestTz,
  }).startOf("day");
  const guestEnd = guestStart.plus({ days: 1 });

  let cursor = guestStart.setZone(hostTz).startOf("day").minus({ days: 1 });
  const lastHostDay = guestEnd.setZone(hostTz).startOf("day").plus({ days: 1 });

  const seen = new Set();
  const slotStarts = [];

  while (cursor <= lastHostDay) {
    const jsDow = luxonWeekdayToJs(cursor.weekday);

    for (const entry of availability) {
      if (Number(entry?.dayOfWeek) !== jsDow) continue;
      const sh = parseHourMinute(entry.startTime);
      const eh = parseHourMinute(entry.endTime);
      if (!sh || !eh) continue;

      const rangeStart = cursor.set({
        hour: sh.h,
        minute: sh.m,
        second: 0,
        millisecond: 0,
      });
      const rangeEnd = cursor.set({
        hour: eh.h,
        minute: eh.m,
        second: 0,
        millisecond: 0,
      });
      if (rangeEnd <= rangeStart) continue;

      let t = rangeStart;
      while (t.plus({ minutes: 30 }) <= rangeEnd) {
        if (t >= guestStart && t < guestEnd) {
          const ms = t.toMillis();
          if (!seen.has(ms)) {
            seen.add(ms);
            slotStarts.push(t.toJSDate());
          }
        }
        t = t.plus({ minutes: 30 });
      }
    }

    cursor = cursor.plus({ days: 1 });
  }

  slotStarts.sort((a, b) => a.getTime() - b.getTime());
  return slotStarts;
}

function guestTimezoneDisplayName() {
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZoneName: "long",
    }).formatToParts(new Date());
    const name = parts.find((p) => p.type === "timeZoneName")?.value;
    if (name) return name;
  } catch {

  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "your local timezone";
}

export default function BookingCalendar({
  availability,
  hostEmail,
  hostName = "Host",
  hostTimeZone = "UTC",
}) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
 
  const [selectedSlotStart, setSelectedSlotStart] = useState(null);
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    topic: "",
  });
  const [submitState, setSubmitState] = useState({
    kind: "idle", 
    message: "",
  });

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [viewDate]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDow = firstOfMonth.getDay();

    const cells = [];
    for (let i = 0; i < startDow; i++) {
      cells.push({ key: `blank-${i}`, date: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);
      cells.push({ key: `day-${day}`, date: d });
    }

    return cells;
  }, [viewDate]);

  const guestTimezoneLabel = useMemo(() => guestTimezoneDisplayName(), []);

  const guestTimeZoneId = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return buildCrossTimezoneSlots(
      selectedDate,
      availability,
      hostTimeZone,
      guestTimeZoneId,
    );
  }, [selectedDate, availability, hostTimeZone, guestTimeZoneId]);

  const hasAvailabilityRules = (availability?.length ?? 0) > 0;

  function openModalFor(slotStart) {
    setSelectedSlotStart(slotStart);
    setSubmitState({ kind: "idle", message: "" });
    setModalOpen(true);
  }

  async function scheduleEvent(e) {
    e.preventDefault();
    if (!selectedSlotStart) return;

    setSubmitState({ kind: "submitting", message: "" });
    try {
      const start = selectedSlotStart;
      const end = addMinutes(start, 30);

      const payload = {
        hostEmail,
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim(),
        topic: form.topic.trim(),
        startISO: start.toISOString(),
        endISO: end.toISOString(),
      };

      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to schedule event");
      }

      setSubmitState({ kind: "success", message: "" });
    } catch (err) {
      setSubmitState({
        kind: "error",
        message: err?.message || "Something went wrong while scheduling.",
      });
    }
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedSlotStart(null);
  }

  function goPrevMonth() {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }

  function goNextMonth() {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Pick a date</p>
              <p className="mt-1 text-xs text-gray-600">{monthLabel}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrevMonth}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50"
                aria-label="Previous month"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50"
                aria-label="Next month"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-gray-500"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarCells.map((cell) => {
              if (!cell.date) {
                return <div key={cell.key} className="h-10" />;
              }

              const cellDate = cell.date;
              const isSelected = selectedDate
                ? cellDate.getTime() === selectedDate.getTime()
                : false;

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDate(cellDate)}
                  className={[
                    "h-10 rounded-xl border px-2 text-xs font-medium transition",
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-900 hover:bg-blue-50",
                  ].join(" ")}
                >
                  {cellDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Available times
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {selectedDate ? (
                  <>
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </>
                ) : (
                  "Select a date to see available slots."
                )}
              </p>
            </div>

            {selectedDate ? (
              <span className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700">
                {slots.length ? `${slots.length} slot(s)` : "No availability"}
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            {!selectedDate ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-600">
                Choose a date from the calendar to generate 30-minute booking
                slots.
              </div>
            ) : (
              <>
                <p className="mb-4 text-xs font-medium text-blue-700">
                  Times shown in {guestTimezoneLabel}
                </p>
                {slots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-600">
                    {!hasAvailabilityRules ? (
                      <>
                        This host has not set weekly availability yet.
                      </>
                    ) : (
                      <>
                        No available times on this date in your timezone. Try
                        another day.
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
                    {slots.map((slotStart) => {
                      const label = formatLocalTimeLabel(slotStart);
                      return (
                        <div
                          key={slotStart.getTime()}
                          className="flex items-center justify-between gap-3 bg-white px-4 py-4"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {label}
                            </p>
                            <p className="text-xs text-gray-500">
                              30-minute slot
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openModalFor(slotStart)}
                            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                          >
                            Confirm
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Schedule meeting"
        >
          <button
            type="button"
            className="absolute inset-0 bg-gray-900/20"
            aria-label="Close modal"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            {submitState.kind === "success" ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                  ✓
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Success! Meeting Scheduled.
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your meeting has been added to {hostName}&apos;s calendar.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Schedule meeting
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedDate && selectedSlotStart ? (
                        <>
                          {selectedDate.toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          <span className="font-medium">
                            {formatLocalTimeLabel(selectedSlotStart)}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={scheduleEvent} className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Guest Name
                    </label>
                    <input
                      value={form.guestName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, guestName: e.target.value }))
                      }
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Guest Email
                    </label>
                    <input
                      type="email"
                      value={form.guestEmail}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, guestEmail: e.target.value }))
                      }
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Meeting Topic/Notes
                    </label>
                    <textarea
                      value={form.topic}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, topic: e.target.value }))
                      }
                      rows={4}
                      className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      placeholder="What would you like to discuss?"
                    />
                  </div>

                  {submitState.kind === "error" ? (
                    <div className="rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700">
                      {submitState.message}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-blue-50"
                      disabled={submitState.kind === "submitting"}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={submitState.kind === "submitting"}
                    >
                      {submitState.kind === "submitting"
                        ? "Scheduling…"
                        : "Schedule Event"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

