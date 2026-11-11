const iso = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
export function todayInTimezone(timeZone = "Asia/Kolkata", now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function getDateRange(type, date) {
  const [year, month, day] = date.split("-").map(Number);
  if (type === "daily") return { from: date, to: date };
  if (type === "month-to-date")
    return { from: `${year}-${String(month).padStart(2, "0")}-01`, to: date };
  const first = new Date(Date.UTC(year, month - 2, 1));
  const last = new Date(Date.UTC(year, month - 1, 0));
  return { from: iso(first), to: iso(last) };
}
