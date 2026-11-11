export const SLOT_LABELS = {
  morning: "Morning (fasting)",
  after_breakfast: "After breakfast",
  after_lunch: "After lunch",
  after_dinner: "After dinner",
};

export const SLOTS = Object.keys(SLOT_LABELS);

export function todayInAppTimezone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function glucoseStatus(value) {
  if (value < 70) return { label: "Low", tone: "low" };
  if (value > 180) return { label: "High", tone: "high" };
  return { label: "In range", tone: "normal" };
}

export function groupReadingsByDate(readings) {
  return Object.entries(
    readings.reduce((groups, reading) => {
      groups[reading.date] ??= [];
      groups[reading.date].push(reading);
      return groups;
    }, {}),
  ).sort(([left], [right]) => right.localeCompare(left));
}
