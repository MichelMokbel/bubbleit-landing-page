// Bubble It operates only in Doha, Qatar (UTC+3, no DST). Booking times are
// Qatar wall-clock everywhere: the backend stores `scheduled_at` as Qatar
// wall-clock serialized with a `+00:00` offset, so it must never be converted
// to the viewer's browser time zone.

export const QATAR_UTC_OFFSET = "+03:00";

const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Format a booking datetime from the API as Qatar wall-clock, regardless of
 * the viewer's time zone. The API labels Qatar wall-clock digits as +00:00,
 * so rendering in the UTC time zone reproduces them verbatim.
 */
export function formatQatarDateTime(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(iso).toLocaleString(locale, { ...options, timeZone: "UTC" });
}

/**
 * Epoch ms of a Qatar wall-clock slot ("YYYY-MM-DD" + "HH:MM"), for comparing
 * against Date.now() to detect slots that have already started.
 */
export function qatarSlotMs(date: string, start: string): number {
  return new Date(`${date}T${start}:00${QATAR_UTC_OFFSET}`).getTime();
}

/**
 * The next `count` calendar days in Qatar, starting from Qatar's today.
 * `date` is YYYY-MM-DD; `label`/`weekday` are formatted for the Qatar date.
 */
export function nextQatarDays(
  count: number,
): { date: string; label: string; weekday: string; monthDay: string }[] {
  const qatarNow = new Date(Date.now() + QATAR_OFFSET_MS);
  const days = [];
  for (let i = 0; i < count; i++) {
    // Anchor at UTC noon so toLocaleDateString(timeZone: "UTC") is unambiguous.
    const d = new Date(
      Date.UTC(
        qatarNow.getUTCFullYear(),
        qatarNow.getUTCMonth(),
        qatarNow.getUTCDate() + i,
        12,
      ),
    );
    const monthDay = d.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    days.push({
      date: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : monthDay,
      weekday: d.toLocaleDateString("en", {
        weekday: "short",
        timeZone: "UTC",
      }),
      monthDay,
    });
  }
  return days;
}
