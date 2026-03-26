"use client";

import { useMemo, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function timeToMinutes(timeStr) {
  // Expects "HH:MM"
  const [h, m] = String(timeStr).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export default function BookingCalendar({ availability }) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(null);

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [viewDate]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 0..6 where 0 is Sunday
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

  const availableRangesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    return (availability || []).filter((a) => Number(a?.dayOfWeek) === dow);
  }, [availability, selectedDate]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    if (!availableRangesForSelectedDay.length) return [];

    const allSlots = [];
    for (const range of availableRangesForSelectedDay) {
      const startMin = timeToMinutes(range.startTime);
      const endMin = timeToMinutes(range.endTime);
      if (startMin === null || endMin === null) continue;
      if (endMin <= startMin) continue;

      for (let t = startMin; t < endMin; t += 30) {
        allSlots.push(minutesToTime(t));
      }
    }

    // Remove duplicates and keep sorted order
    return Array.from(new Set(allSlots)).sort();
  }, [availableRangesForSelectedDay, selectedDate]);

  function onConfirm(time) {
    // For now: just log selection. Later this can trigger booking flow.
    const date = selectedDate ? selectedDate.toISOString().slice(0, 10) : null;
    console.log("Selected booking time:", { date, time });
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
                {availableRangesForSelectedDay.length
                  ? `${slots.length} slot(s)`
                  : "No availability"}
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            {!selectedDate ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-600">
                Choose a date from the calendar to generate 30-minute booking
                slots.
              </div>
            ) : availableRangesForSelectedDay.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-600">
                This host isn&apos;t available on the selected day of the week.
                Try another date.
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-600">
                No slots available for the selected day with the current time range.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
                {slots.map((time) => (
                  <div
                    key={time}
                    className="flex items-center justify-between gap-3 bg-white px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {time}
                      </p>
                      <p className="text-xs text-gray-500">
                        30-minute slot
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onConfirm(time)}
                      className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Confirm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

