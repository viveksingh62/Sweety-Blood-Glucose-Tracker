import { todayInAppTimezone } from "../utils/reading.js";

export default function DatePicker({ label, value, onChange }) {
  return (
    <label className="date-label">
      {label}
      <input
        type="date"
        max={todayInAppTimezone()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
